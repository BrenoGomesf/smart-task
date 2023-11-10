import { HTMLProps } from 'react'
import styles from './styles.module.css'
export function TextArea({...res}: HTMLProps<HTMLTextAreaElement>){
    return <textarea className={styles.textarea} {...res}></textarea>
}