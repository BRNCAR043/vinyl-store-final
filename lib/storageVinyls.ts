import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadVinylCover(
  file: File,
  vinylId: string
): Promise<string> {
  const imageRef = ref(storage, `vinyls/${vinylId}/cover.jpg`);

  await uploadBytes(imageRef, file);

  return await getDownloadURL(imageRef);
}
