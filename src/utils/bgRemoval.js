// ./utils/bgRemoval.js

export async function processVegetablePhoto(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // 1. 建立原始畫布載入圖片
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // 2. 取得影像像素資料進行去背與邊界分析
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imgData.data;

                // 簡單去背或 Alpha 邊界檢測
                // 假設你的去背工具已經處理好透明通道 (Alpha)
                // 接下來我們進行 Bounding Box 自動裁切運算：
                let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;

                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x++) {
                        const alphaIndex = (y * canvas.width + x) * 4 + 3;
                        // 檢查像素是否不透明（alpha > 20 代表有主體）
                        if (data[alphaIndex] > 20) {
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                }

                // 如果找不到有效像素，就回傳原圖
                if (minX >= maxX || minY >= maxY) {
                    resolve(e.target.result);
                    return;
                }

                // 加上一點點 padding (例如 10%) 讓裁切不要太死貼邊緣
                const padding = 20;
                minX = Math.max(0, minX - padding);
                minY = Math.max(0, minY - padding);
                maxX = Math.min(canvas.width, maxX + padding);
                maxY = Math.min(canvas.height, maxY + padding);

                const cropWidth = maxX - minX;
                const cropHeight = maxY - minY;

                // 3. 建立最終裁切後的畫布
                const cropCanvas = document.createElement('canvas');
                const cropCtx = cropCanvas.getContext('2d');
                cropCanvas.width = cropWidth;
                cropCanvas.height = cropHeight;

                // 將偵測到的蔬菜範圍畫到新畫布上
                cropCtx.drawImage(
                    canvas,
                    minX, minY, cropWidth, cropHeight,
                    0, 0, cropWidth, cropHeight
                );

                // 輸出裁切後的圖片 URL
                resolve(cropCanvas.toDataURL('image/png'));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}