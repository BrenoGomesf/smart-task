import type { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import styles from '../../styles/home.module.css'
import Image from 'next/image'
import HeroImg from '../../public/assets/hero.png'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../services/firebaseConnection'

interface HomeProps{
  posts: number, 
  comments: number
}
export default function Home({posts, comments}: HomeProps){
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas+ | Organize suas tarefas de forma facil</title>
      </Head>

       <main className={styles.main}>
          <div className={styles.logoContent}>
            <Image 
            className={styles.hero}
            alt='Logo Tarefas'
            src={HeroImg}
            priority={true}
            />
            <h1 className={styles.title}
            >Sistema feito para você organizar <br/> seus estudos e tarefas</h1>
          </div>

          <div className={styles.infoContent}>
              <section className={styles.box}> 
                  <span> + {posts } posts </span>
              </section>
              <section className={styles.box}> 
                  <span> + { comments } comentarios </span>
              </section>
          </div>
      </main>
    </div>
  )
}



export const getStaticProps: GetStaticProps = (async () => {

  const commentsRef = collection(db, "comments")
  const postRef = collection(db, "tasks")

  const commentSnapshot = await getDocs(commentsRef);
  const postSnapshot = await getDocs(postRef);
  
  return {
    props:{
      posts: postSnapshot.size || 0,
      comments: commentSnapshot.size || 0
    },
    revalidate: 60
  }
})