import { ChangeEvent, FormEvent, useState } from 'react';
import Head from 'next/head';
import styles from './styles.module.css'
import { GetServerSideProps } from 'next';
import { db } from '../../services/firebaseConnection';
import { FaTrash } from 'react-icons/fa'
import { 
    doc, 
    collection,
    query,
    where,
    getDoc,
    addDoc,
    getDocs,
    deleteDoc,
 } from 'firebase/firestore';
 import { TextArea } from '../../components/textarea'
import { useSession } from 'next-auth/react';
 interface TaskProps {
    item:{
        tarefa: string,
        public: boolean,
        created: string,
        user: string,
        taskId: string
    }, 
    allComments: CommmentsProps[]
 }

 interface CommmentsProps{
    id:string,
    comment: string;
    taskId: string;
    user: string;
    name: string;
 }
export default function Task({ item, allComments }: TaskProps){

    const { data: session } = useSession()

    const [input, setIpunt] = useState("")

    const [comments, setComments] = useState<CommmentsProps[]>(allComments || []);

   async function handleComment(event: FormEvent){
    event.preventDefault
    if(input === "" || !session?.user?.email || !session?.user?.name) return;

    try {
        
        const docRef = await addDoc(collection(db, "comments"), {
            comment: input,
            created: new Date(),
            user: session?.user.email,
            name: session?.user.name,
            taskId: item.taskId,
        })
        const data = {
            id: docRef.id,
            comment: input,
            user: session?.user.email,
            name: session?.user.name,
            taskId: item.taskId,
        }
        setComments((oldItems) => [...oldItems, data])
        setIpunt("")

    } catch (error) {
        console.log(error)
    }
   }

   async function handleDeleteComment(id: string) {
        try {
            const docRef = doc(db, 'comments', id);
           
            await deleteDoc(docRef)

            const deleteComment = comments.filter( (comment) => comment.id !== id)
           
            setComments(deleteComment);
            
        } catch (error) {
            console.log(error)
        }
   }


    return(
        <div className={styles.container}>
            <Head>
                <title>Tarefa - Detalhes da Tarefa</title>
            </Head>

            <main className={styles.main}>
                <h1>Tarefa</h1>
                <article className={styles.task}>
                    <p>{item?.tarefa}</p>
                </article>
            </main>

            <section className={styles.commentsContainer}>
                <h2>Deixar comentario</h2>

                <form onSubmit={handleComment}>
                    <TextArea
                    placeholder='Digite seu comentario...'
                    value={input}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement> ) => setIpunt(event.target.value)}
                    />
                    <button 
                    disabled={!session?.user}
                    className={styles.button}>Enviar comentario</button>
                </form>
            </section>

            <section className={styles.commentsContainer}>
                <h2>Todos comentarios</h2>
                {
                    comments.length === 0 && (
                        <span>Nenhum comentario encontrado</span>
                    )
                }
                {
                    comments.map((item) => (
                        <article key={item.id} className={styles.comment}>
                            <div className={styles.headComment}>
                                <label className={styles.commentsLabel}>{item.name}</label>

                                { item.user === session?.user?.email && (
                                <button className={styles.buttonTrash} onClick={() => handleDeleteComment(item.id)}>
                                    <FaTrash
                                    size={18}
                                    color='#EA3140'/>
                                </button>
                                ) }
                            </div>
                            <p>{item.comment}</p>
                        </article>
                    ))
                }
            </section>
        </div>
    )
}
export const getServerSideProps: GetServerSideProps = (async ({ params } ) => {
    const id = params?.id as string;

    const docRef = doc(db, 'tasks', id);

    const snapshot = await getDoc(docRef);

    const q = query(collection(db, "comments"), where("taskId", '==', id ))

    const snapshotComments = await getDocs(q)

    let allComments: CommmentsProps[] = []

    snapshotComments.forEach((doc) =>{
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            taskId: doc.data().taskId,
            user: doc.data().user,
            name: doc.data().name
        })
    })
    
    if(snapshot.data() === undefined || !snapshot.data()?.public){
        return {
            redirect:{
                destination: '/',
                permanent: false
            }
        }
    }

    const mileseconds = snapshot.data()?.created?.seconds * 1000;

    const task = {
        tarefa: snapshot.data()?.tarefa,
        public: snapshot.data()?.public,
        created: new Date(mileseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
        taskId: id,
    }

    return {
        props:{
            item: task,
            allComments: allComments
        }
    }
}) 