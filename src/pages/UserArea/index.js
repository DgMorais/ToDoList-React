import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import { signOut } from "firebase/auth";
import { addDoc, collection, onSnapshot, query, orderBy, where, doc, deleteDoc, updateDoc } from "firebase/firestore";

import { auth, db } from '../../services/firebaseConnection';
import '../../styles/user-area.css'

import { BsFillTrashFill, BsListCheck } from 'react-icons/bs';
import { FaEdit, FaTimes } from 'react-icons/fa';

function UserArea() {
  const [title, setTitle] = useState('');
  const [task, setTasks] = useState([]);
  const [listTasks, setListTasks] = useState([]);
  const [listTasksFinished, setListTasksFinished] = useState([]);
  const [userDetail, setUserDetail] = useState({});
  const [dataEdit, setDataEdit] = useState({});

  useEffect(() => {
    async function loadTasks() {
      const userDetail = localStorage.getItem('@detailUser');
      setUserDetail(JSON.parse(userDetail));

      if (userDetail) {
        const data = JSON.parse(userDetail);
        
        const tarefasRef = collection(db, 'tasks');

        const q = query(tarefasRef, where('userUid', '==', data?.uid), where('finished', '==', false), orderBy('created', 'desc'));
        const unsub = onSnapshot(q, (querySnapshot) => {
          const tasksList = [];
          querySnapshot.forEach((doc) => {
            tasksList.push({
              id: doc.id,
              title: doc.data().title,
              task: doc.data().task,
              finished: doc.data().finished,
              userUid: doc.data().userUid,
              created: doc.data().created
            })
          });

          setListTasks(tasksList);
        });
      }
    }

    loadTasks();
  }, []);

  async function saveTask(e) {
    e.preventDefault();
    if (title === '' && task === '') {
      toast.warning('Você precisa preencher os campos!');
    } else {
      if (dataEdit?.id) {
        updateTask();
      } else {
        await addDoc(collection(db, 'tasks'), 
        { 
          title: title, 
          task: task,
          finished: false,
          created: new Date(),
          userUid: userDetail?.uid
        })
        .then(() => {
          setTitle('');
          setTasks('');
          toast.success('Tarefa salva com sucesso!');
        })
        .catch((error) => {
          console.error(error)
          toast.error('Erro ao salvar tarefa!');
        });
      }
    }
  }

  async function editTask(task, modal) {
    if (modal) {
      document.getElementById('modal-tasks-finished').style.visibility = 'hidden';
    }
    setTitle(task.title);
    setTasks(task.task);
    setDataEdit(task);
  }

  async function updateTask() {
    const docRef = doc(db, 'tasks', dataEdit.id);
    await updateDoc(docRef, {
      title: title,
      task: task,
      created: new Date()
    })
    .then(() => {
      toast.success('Tarefa atualizada com sucesso!');
      setTitle('');
      setTasks('');
      setDataEdit({});
    })
    .catch((error) => {
      console.error(error)
      setTitle('');
      setTasks('');
      setDataEdit({});
      toast.error('Erro ao atualizar tarefa!');
    });
  }

  async function deleteTask(id) {
    const docRef = doc(db, 'tasks', id);

    await deleteDoc(docRef)
    .then(() => {
      toast.success('Tarefa deletada com sucesso!');
    })
    .catch((error) => {
      console.error(error)
      toast.error('Erro ao deletar tarefa!');
    });
  }

  async function logout() {
    toast.info('Obrigado por usar nossa aplicação!');
    await signOut(auth);
  }

  async function finishTask(id, finished) {
    const docRef = doc(db, 'tasks', id);

    await updateDoc(docRef, {
      finished: finished
    })
    .then(() => {
      if (finished) {
        toast.success('Tarefa finalizada com sucesso!');
        // document.getElementById(`task-${id}`).style.textDecoration = 'line-through';
        // document.getElementById(`task-${id}`).classList.toggle('hide');
      } else {
        toast.success('Tarefa reaberta com sucesso!');
        document.getElementById(`task-${id}`).style.textDecoration = 'none';
      }
    })
    .catch((error) => {
      console.error(error)
      toast.error('Erro ao finalizar tarefa!');
    });
  }

  async function showTasksCompleted() {
    const userDetail = localStorage.getItem('@detailUser');
    setUserDetail(JSON.parse(userDetail));

    if (userDetail) {
      const data = JSON.parse(userDetail);
      
      const tarefasRef = collection(db, 'tasks');
      const q = query(tarefasRef, where('userUid', '==', data?.uid), where('finished', '==', true), orderBy('created', 'desc'));
      const unsub = onSnapshot(q, (querySnapshot) => {
        const tasksListFinished = [];
        querySnapshot.forEach((doc) => {
          tasksListFinished.push({
            id: doc.id,
            title: doc.data().title,
            task: doc.data().task,
            finished: doc.data().finished,
            userUid: doc.data().userUid,
            created: doc.data().created
          })
        });
        setListTasksFinished(tasksListFinished);
      })

      if (listTasksFinished) {
        document.getElementById('modal-tasks-finished').style.visibility = 'visible';
      }
    }
  }

  function clearTextsAreas() {
    setTitle('');
    setTasks('');
    setDataEdit({});
  }

  return (
    <div className="user-container">
      <div className="input-content">
        <div className="task-description">
          <h1>Adicionar tarefa</h1>
          <form onSubmit={saveTask}>
            <input type='text' placeholder="Titulo da tarefa..." value={title} onChange={(e) => setTitle(e.target.value)}/>
            <textarea placeholder="Digíte sua tarefa..." value={task} onChange={(e) => setTasks(e.target.value)}/>
            {
              Object.keys(dataEdit).length > 0 ? (
                <button type="submit">Atualizar tarefa</button>
              ) : (
                <button type="submit">Salvar tarefa</button>
              )
            }
          </form>
          <button onClick={clearTextsAreas}>Limpar campos de texto</button>
        </div>
        <div className="area-btn">
          <button className="exit" onClick={logout}>Sair</button>
          <BsListCheck className="task-finished" onClick={showTasksCompleted} size={18} color="#000" title="Tarefas completas"/>
        </div>
      </div>
      <div className="tasks-content">
        <h2>Minhas Tarefas</h2>
        {
          listTasks.map((task) => (
            <article key={task.id} id={`task-${task.id}`} className='article-tasks'>
              <div className="title-content">
                <label className="checkbox-content">
                  <input type="checkbox" name={`task-${task.id}`}/>
                  <span onClick={() => finishTask(task.id, true)}></span>
                </label>
                <h4 htmlFor={`task-${task.id}`}>{task.title}</h4>
                <FaEdit onClick={() => editTask(task, false)} size={18} color="#000" />
                <BsFillTrashFill onClick={() => deleteTask(task.id)} size={18} color="#FF0000" />
              </div>
              <div className="description-content">
                <span>{task.task}</span>
              </div>
            </article>    
          ))
        }
      </div>
      <div className="modal" id="modal-tasks-finished">
        <div className="modal-content">
          <div className="modal-header">
            <div></div>
            <h2>Tarefas finalizadas</h2>
            <FaTimes onClick={() => document.getElementById('modal-tasks-finished').style.visibility = 'hidden'} size={18} color="#000" />
          </div>
          <div className="modal-body">
            {
              listTasksFinished.map((task) => (
                <article key={task.id} id={`task-${task.id}`} className='article-tasks'>
                  <div className="title-content">
                    <label className="checkbox-content">
                      <input type="checkbox" name={`task-${task.id}`} checked={true}/>
                      <span onClick={() => finishTask(task.id, false)}></span>
                    </label>
                    <h4 htmlFor={`task-${task.id}`}>{task.title}</h4>
                    <BsFillTrashFill onClick={() => deleteTask(task.id, true)} size={18} color="#FF0000" />
                  </div>
                  <div className="description-content">
                    <span>{task.task}</span>
                  </div>
                </article>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserArea;