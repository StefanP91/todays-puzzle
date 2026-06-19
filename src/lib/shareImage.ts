import type { Cell, LetterState } from "../types";
import { MAX_GUESSES, WORD_LENGTH } from "../types";
import { buildShareImageCaption } from "./game";
import { getShareUrl } from "./share";

const SHARE_WIDTH = 1200;
const SHARE_HEIGHT = 630;

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
  const width = SHARE_WIDTH;
  const height = SHARE_HEIGHT;
  const centerX = width / 2;
  const cell = 38;
  const gap = 5;
  const gridW = WORD_LENGTH * cell + (WORD_LENGTH - 1) * gap;
  const gridH = MAX_GUESSES * cell + (MAX_GUESSES - 1) * gap;
  const gridX = Math.round((width - gridW) / 2);
  const gridY = 108;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, width, height);

  roundRect(ctx, 24, 24, width - 48, height - 48, 20);
  ctx.fillStyle = "#16213e";
  ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = 'bold 38px "Segoe UI", system-ui, sans-serif';
  ctx.fillText("Денешна Загатка", centerX, 68);

  const score = won ? `${guesses.length}/6` : "X/6";
  ctx.fillStyle = "#9ca3af";
  ctx.font = '24px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(`#${puzzleNumber}  ${score}`, centerX, 100);

  for (let row = 0; row < MAX_GUESSES; row++) {
    for (let col = 0; col < WORD_LENGTH; col++) {
      const x = gridX + col * (cell + gap);
      const y = gridY + row * (cell + gap);
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

  const site = getShareUrl();
  const { headline, link } = buildShareImageCaption(
    puzzleNumber,
    won,
    guesses.length,
    site
  );
  const displayLink = link.replace(/^https?:\/\//, "");
  const footerY = gridY + gridH + 48;

  ctx.fillStyle = "#e5e7eb";
  ctx.font = 'bold 24px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(headline, centerX, footerY);

  ctx.fillStyle = "#60a5fa";
  ctx.font = '22px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(displayLink, centerX, footerY + 34);

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
