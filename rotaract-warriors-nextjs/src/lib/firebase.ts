import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

// Replace with your real Firebase Web configuration credentials
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };

export interface GalleryItem {
  id?: string;
  title: string;
  image: string; // Base64 or Firebase Storage URL
  event: string;
  category: string;
  date: string;
  description?: string;
  published: boolean;
  createdAt: any;
}

// 1. Upload Base64 image to Storage (or return same string if not valid base64)
export async function uploadImageToStorage(base64Str: string, fileName: string): Promise<string> {
  if (!base64Str.startsWith("data:image/")) {
    return base64Str; // Already a URL or fallback
  }

  const storageRef = ref(storage, `gallery/${Date.now()}_${fileName}`);
  // uploadString supports dataUrl format
  await uploadString(storageRef, base64Str, "data_url");
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

// 2. Save metadata to Firestore
export async function saveImageMetadata(item: Omit<GalleryItem, "createdAt">): Promise<string> {
  const docRef = await addDoc(collection(db, "gallery_echoes"), {
    ...item,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

// 3. Fetch published images
export async function fetchPublishedImages(): Promise<GalleryItem[]> {
  try {
    const q = query(collection(db, "gallery_echoes"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const items: GalleryItem[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as GalleryItem;
      if (data.published) {
        items.push({ ...data, id: doc.id });
      }
    });
    return items;
  } catch (e) {
    console.error("Error fetching images, loading fallback static mock data", e);
    return getStaticFallbackGallery();
  }
}

// 4. Listen for realtime database updates
export function onImagesUpdate(callback: (items: GalleryItem[]) => void) {
  const q = query(collection(db, "gallery_echoes"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const items: GalleryItem[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as GalleryItem;
      if (data.published) {
        items.push({ ...data, id: doc.id });
      }
    });
    // Fallback if firestore collection is empty
    if (items.length === 0) {
      callback(getStaticFallbackGallery());
    } else {
      callback(items);
    }
  }, (err) => {
    console.warn("Realtime listener failed, falling back to static local mock data", err);
    callback(getStaticFallbackGallery());
  });
}

// 5. High-quality static mock images matching the offline projects assets
function getStaticFallbackGallery(): GalleryItem[] {
  return Array.from({ length: 11 }).map((_, i) => ({
    id: `static-${i}`,
    title: [
      "Secondary HSR Cycle Day Support",
      "Pulse Polio Vaccination Volunteer Booths",
      "Afforestation Sapling Drive with BDA",
      "Karnataka U-19 Deaf Cricket Sponsor",
      "RYLA Youth Leadership Summit",
      "Skin Bank Donation Awareness",
      "Manjushree Charitable Clinic Medicine Drive",
      "Youth Care Initiative",
      "Cleanliness Awareness Campaign",
      "Rural Development Project",
      "Education for All Campaign"
    ][i] || `Warriors Memory #${i}`,
    image: `assets/projects/proj-${i}.png`,
    event: `Project Phase ${i + 1}`,
    category: ["Community Service", "Environmental", "Professional Dev", "International Service", "Club Service"][i % 5],
    date: `2026-06-${10 + i}`,
    description: "Young change-makers of Rotaract Bangalore Warriors working hand-in-hand to build a sustainable tomorrow.",
    published: true
  }));
}
