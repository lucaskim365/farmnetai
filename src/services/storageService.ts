import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
];

const ALLOWED_FILE_TYPES = [
    ...ALLOWED_IMAGE_TYPES,
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
    "application/haansofthwp",
    "application/x-hwp",
];

export function isImageFile(file: File): boolean {
    return ALLOWED_IMAGE_TYPES.includes(file.type) || file.type.startsWith("image/");
}

export function validateFile(file: File): string | null {
    if (file.size > MAX_FILE_SIZE) {
        return `파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE / (1024 * 1024)}MB까지 업로드 가능합니다.`;
    }

    // 허용된 타입이거나 이미지면 통과
    if (!ALLOWED_FILE_TYPES.includes(file.type) && !file.type.startsWith("image/")) {
        return "지원하지 않는 파일 형식입니다. (이미지, PDF, 문서, 엑셀, 텍스트 파일만 가능)";
    }

    return null;
}

export async function uploadFileToStorage(
    userId: string,
    roomId: string,
    file: File
): Promise<{ url: string; name: string; size: number; type: string }> {
    const error = validateFile(file);
    if (error) {
        throw new Error(error);
    }

    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const storageRef = ref(storage, `users/${userId}/rooms/${roomId}/${safeName}`);

    await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
            originalName: file.name,
        },
    });

    const url = await getDownloadURL(storageRef);

    return {
        url,
        name: file.name,
        size: file.size,
        type: file.type,
    };
}

export async function deleteFileFromStorage(fileUrl: string): Promise<void> {
    try {
        const storageRef = ref(storage, fileUrl);
        await deleteObject(storageRef);
    } catch (error) {
        console.error("파일 삭제 실패:", error);
    }
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileExtension(filename: string): string {
    return filename.split(".").pop()?.toLowerCase() || "";
}
