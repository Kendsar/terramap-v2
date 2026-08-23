import { db } from './config';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Property } from '@/types';

const PROPERTIES_COLLECTION = 'properties';

export async function getProperties(): Promise<Property[]> {
  const querySnapshot = await getDocs(collection(db, PROPERTIES_COLLECTION));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Property));
}

export async function addProperty(property: Omit<Property, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, PROPERTIES_COLLECTION), property);
  return docRef.id;
}
