import { removeBackground } from '@imgly/background-removal';

export async function processVegetablePhoto(imageFile) {
    try {
        const blob = await removeBackground(imageFile);
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Background removal failed:", error);
        return URL.createObjectURL(imageFile);
    }
}