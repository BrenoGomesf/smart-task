import { GetServerSideProps } from 'next'
import styles from './styles.module.css'
import Head from 'next/head'
import { getSession } from 'next-auth/react'
import { TextArea } from '../../components/textarea'
import { FiShare2 } from 'react-icons/fi'
import { FaTrash } from 'react-icons/fa'
import { ChangeEvent, FormEvent, useState, useEffect } from 'react'
import { db } from '../../services/firebaseConnection';
import Link from 'next/link'
import { 
    addDoc,
    collection,
    query,
    orderBy,
    where,
    onSnapshot, 
    doc,
    deleteDoc
 } from 'firebase/firestore';
import { link } from 'fs'

 interface HomeProps{
    user: {
        email: string;
    }
  }
  interface TaskProps{
    id: string;
    created: Date;
    public: boolean;
    tarefa: string;
    user: string;
  }
 export const getServerSideProps = (async ({req} ) => {
     const session = await getSession({req});
     if(!session?.user){
        return {
            redirect:{
                destination: '/',
                permanent: false
            }
        }
     }
    return { props:
         { 
           user:{
              email: session?.user.email
           }
        }
     }
  }) satisfies GetServerSideProps<{
    user: any
  }>


export default function Dashboard({ user }: HomeProps){
    const [input, setInput] = useState("");
    const [publicTask, setPublicTask] = useState(false);
    const  [tasks, setTasks] = useState<TaskProps[]>([])
    useEffect(() => {
        async function loadTask(){
            const taskRef = collection(db, "tasks")
            const q = query(
                taskRef,
                orderBy("created", "desc"),
                where("user", "==", user?.email)
            )
            onSnapshot(q, (snapshot) => {
                let list = [] as TaskProps[];
                snapshot.forEach((doc) => {
                    list.push({
                        id: doc.id,
                        tarefa: doc.data().tarefa,
                        created: doc.data().created,
                        user: doc.data().user,
                        public: doc.data().public   
                    })
                })
                setTasks(list)
            })
        }
        loadTask()
    }, [user?.email])
    
        function handleChangePublic(event : ChangeEvent<HTMLInputElement> ){
            setPublicTask(event.target.checked);
        };   

       async function handleRegisterTask(event: FormEvent){
            event.preventDefault();

            if(input === "") return;
            try {
                await addDoc(collection(db, "tasks"), {
                    tarefa: input,
                    created: new Date(),
                    user: user.email,
                    public: publicTask
                })
                setInput("");
                setPublicTask(false);
            } catch (error) {
                console.log(error)
            }
        }


        async function handleShare(id: string){
            await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_URL}/task/${id}`)
        }

        async function handleDeleteTask(id: string){
            const docRef = doc(db, "tasks", id);
            await deleteDoc(docRef);
        }
    return(
        <div className={styles.container}>
            <Head>
                Meu painel de tarefas
            </Head>
    
            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}> Qual sua Tarefa?</h1>
                        
                        <form onSubmit={handleRegisterTask}>
                        <TextArea
                        placeholder='Digite qual sua tarefa...'
                        value={input}
                        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event?.target.value)}
                        />
                        <div className={styles.checkboxArea}>
                            <input type='checkbox'
                            className={styles.checkbox}
                            checked={publicTask}
                            onChange={handleChangePublic}
                            />
                            <label>Deixa tarefa publica?</label>
                        </div>
                        <button type='submit' className={styles.button}> Registrar</button>
                        </form>
                    </div>
                </section>

                <section className={styles.taskContainer}>
                    <h1>Minhas tarefas</h1>
                    { tasks.length === 0 && (
                        <p style={{marginTop: '10px'}}>Nenhuma tarefa </p>
                    )}
                    { tasks.map((item) => (
                     <article key={item.id} className={styles.task}>
                        {item.public && (
                            <div className={styles.tagContainer}>
                            <label className={styles.tag}>PUBLICO</label>
                            <button className={styles.sharedButton} onClick={ () => handleShare(item.id)}>
                                <FiShare2
                                size={22}
                                color='#3183ff'
                                />
                            </button>
                            </div>
                        )}
                        <div className={styles.taskContent}>
                            {
                                item.public ? (
                                    <Link href={`task/${item.id}`}>
                                        <p >{item.tarefa}</p>
                                    </Link>
                                ) : (<p >{item.tarefa}</p>)
                            }
                            <button className={styles.transhButton} onClick={()=> handleDeleteTask(item.id)}>
                                <FaTrash
                                size={24}
                                color='#ea3140'
                                />
                            </button>
                        </div>
                     </article>
                    ))}

                </section>
            </main>

        </div>
        )    
    }



