import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import { signOut } from "firebase/auth";
import { addDoc, collection, onSnapshot, query, orderBy, where, doc, deleteDoc, updateDoc } from "firebase/firestore";

import { auth, db } from '../../services/firebaseConnection';
import '../../styles/user-area.css'

import { BsFillTrashFill } from 'react-icons/bs';
import { FaEdit } from 'react-icons/fa';

function UserArea() {
  const [title, setTitle] = useState('');
  const [task, setTasks] = useState([]);
  const [listTasks, setListTasks] = useState([]);
  const [userDetail, setUserDetail] = useState({});
  const [dataEdit, setDataEdit] = useState({});

  useEffect(() => {
    async function loadTasks() {
      const userDetail = localStorage.getItem('@detailUser');
      setUserDetail(JSON.parse(userDetail));

      if (userDetail) {
        const data = JSON.parse(userDetail);
        
        const tarefasRef = collection(db, 'tasks');

        const q = query(tarefasRef, where('userUid', '==', data?.uid), orderBy('created', 'desc'));
        const unsub = onSnapshot(q, (querySnapshot) => {
          const tasksList = [];
          querySnapshot.forEach((doc) => {
            tasksList.push({
              id: doc.id,
              title: doc.data().title,
              task: doc.data().task,
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

  async function editTask(task) {
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
        </div>
        <button className="exit" onClick={logout}>Sair</button>
      </div>
      <div className="tasks-content">
        <h2>Minhas Tarefas</h2>
        {
          listTasks.map((task) => (
            <article key={task.id}>
              <div className="title-content">
                <h4>{task.title}</h4>
                <FaEdit onClick={() => editTask(task)} size={18} color="#000" />
                <BsFillTrashFill onClick={() => deleteTask(task.id)} size={18} color="#FF0000" />
              </div>
              <div className="description-content">
                <span>{task.task}</span>
              </div>
            </article>    
          ))
        }
      </div>
    </div>
  );
}

export default UserArea;