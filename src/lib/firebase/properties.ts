import { db } from './config';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { NewProperty, Property } from '@/types';

const PROPERTIES_COLLECTION = 'properties';

function toMillis(value: unknown): number | undefined {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === 'number') return value;
  return undefined;
}

function mapDocument(id: string, data: DocumentData): Property {
  const { createdAt, ...rest } = data;
  return {
    ...(rest as Omit<Property, 'id' | 'createdAt'>),
    id,
    createdAt: toMillis(createdAt),
  };
}

/**
 * Public listings only. The `status` filter is required: the Firestore rules
 * authorize reads per document, so an unconstrained collection query is rejected.
 */
export async function getProperties(): Promise<Property[]> {
  const activeProperties = query(
    collection(db, PROPERTIES_COLLECTION),
    where('status', '==', 'active')
  );
  const querySnapshot = await getDocs(activeProperties);
  return querySnapshot.docs.map((doc) => mapDocument(doc.id, doc.data()));
}

export async function addProperty(property: NewProperty): Promise<string> {
  const docRef = await addDoc(collection(db, PROPERTIES_COLLECTION), {
    ...property,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
