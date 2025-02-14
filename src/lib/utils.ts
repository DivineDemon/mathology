import { type ClassValue, clsx } from "clsx";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import { twMerge } from "tailwind-merge";

GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateString(str: string, num: number) {
  return str.length > num ? `${str.slice(0, num)}...` : str;
}

export async function parseImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const converted = await fetch(
    `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const response: {
    data: { url: String };
  } = await converted.json();

  return response.data.url;
}

export async function extractPdfText(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      if (!event.target?.result) {
        return reject(new Error("Failed to read file"));
      }

      try {
        const arrayBuffer = event.target.result as ArrayBuffer;
        const pdf = await getDocument({ data: arrayBuffer }).promise;

        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(" ") + "\n";
        }

        resolve(text);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
