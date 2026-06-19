import type { Cell, LetterState } from "../types";
import { MAX_GUESSES, WORD_LENGTH } from "../types";
import { GAME_SITE_URL, getShareUrl } from "./share";

const STATE_COLORS: Record<LetterState, string | null> = {
  correct: "#538d4e",
  present: "#b59f3b",
  absent: "#3a3a3c",
  empty: null,
  tbd: null,
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function generateShareImage(options: {
  puzzleNumber: number;
  guesses: Cell[][];
  won: boolean;
}): Promise<Blob> {
  const { puzzleNumber, guesses, won } = options;
  const cell = 56;
  const gap = 6;
  const gridW = WORD_LENGTH * cell + (WORD_LENGTH - 1) * gap;
  const gridH = MAX_GUESSES * cell + (MAX_GUESSES - 1) * gap;
  const pad = 32;
  const width = gridW + pad * 2;
  const height = pad + 52 + gridH + 36 + pad;

  const canvas = document.createElement("canvas");
  const scale = 2;
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.scale(scale, scale);
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, width, height);

  roundRect(ctx, 12, 12, width - 24, height - 24, 16);
  ctx.fillStyle = "#16213e";
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = 'bold 20px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("Денешна Загатка", width / 2, pad + 8);

  const score = won ? `${guesses.length}/6` : "X/6";
  ctx.fillStyle = "#9ca3af";
  ctx.font = '16px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(`#${puzzleNumber}  ${score}`, width / 2, pad + 32);

  const startX = pad;
  const startY = pad + 52;

  for (let row = 0; row < MAX_GUESSES; row++) {
    for (let col = 0; col < WORD_LENGTH; col++) {
      const x = startX + col * (cell + gap);
      const y = startY + row * (cell + gap);
      const cellData = guesses[row]?.[col];
      const color = cellData ? STATE_COLORS[cellData.state] : null;

      roundRect(ctx, x, y, cell, cell, 6);
      if (color) {
        ctx.fillStyle = color;
        ctx.fill();
      } else {
        ctx.strokeStyle = "#3a3a3c";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  const site = getShareUrl().replace(/^https?:\/\//, "");
  ctx.fillStyle = "#6b7280";
  ctx.font = '13px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(site || GAME_SITE_URL.replace(/^https?:\/\//, ""), width / 2, startY + gridH + 28);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to generate share image"));
    }, "image/png");
  });
}

export function blobToObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}
