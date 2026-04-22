import PDFDocument from 'pdfkit';
import type { Response } from 'express';
import fs from 'fs';
import path from 'path';
import https from 'https';

const FONTS_DIR = path.join(__dirname, '../../fonts');

const FONT_URLS: Record<string, string> = {
  'Inter-Regular.ttf': 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-cyrillic-400-normal.ttf',
  'Inter-Bold.ttf': 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-cyrillic-700-normal.ttf'
};

let fontsInitialized = false;

async function downloadFont(filename: string): Promise<string> {
  const filePath = path.join(FONTS_DIR, filename);

  if (fs.existsSync(filePath)) return filePath;

  const url = FONT_URLS[filename];
  if (!url) throw new Error(`Font URL not found for ${filename}`);

  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download font ${filename}: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✅ Downloaded font: ${filename}`);
        resolve(filePath);
      });
    }).on('error', reject);
  });
}

async function initFonts() {
  if (fontsInitialized) return true;

  // Ensure fonts directory exists
  if (!fs.existsSync(FONTS_DIR)) {
    fs.mkdirSync(FONTS_DIR, { recursive: true });
  }

  // Download fonts if missing
  for (const filename of Object.keys(FONT_URLS)) {
    await downloadFont(filename);
  }

  fontsInitialized = true;
  return true;
}

export interface ReferralData {
  userName: string;
  userEmail: string;
  enterpriseName: string;
  enterpriseAddress: string;
  enterpriseContact: string;
  excursionTitle: string;
  excursionDate: string;
  excursionType: string;
  referralNumber: string;
  generatedAt: string;
}

export async function generateReferralPDF(res: Response, data: ReferralData) {
  await initFonts();

  const doc = new PDFDocument({
    size: 'A4',
    margin: 60,
    font: path.join(FONTS_DIR, 'Inter-Regular.ttf')
  });

  doc.registerFont('Inter-Regular', path.join(FONTS_DIR, 'Inter-Regular.ttf'));
  doc.registerFont('Inter-Bold', path.join(FONTS_DIR, 'Inter-Bold.ttf'));

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="referral-${data.referralNumber}.pdf"`);

  doc.pipe(res);

  // Header
  doc
    .font('Inter-Bold')
    .fontSize(18)
    .text('НАПРАВЛЕНИЕ НА ЭКСКУРСИЮ', { align: 'center' })
    .moveDown(0.5);

  doc
    .font('Inter-Regular')
    .fontSize(10)
    .text(`Номер: ${data.referralNumber}`, { align: 'center' })
    .text(`Дата формирования: ${data.generatedAt}`, { align: 'center' })
    .moveDown(1);

  // Divider
  doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).stroke();
  doc.moveDown(1);

  // Section: Соискатель
  doc
    .font('Inter-Bold')
    .fontSize(13)
    .text('Данные соискателя', { underline: true })
    .moveDown(0.5);

  doc
    .font('Inter-Regular')
    .fontSize(11)
    .text(`ФИО: ${data.userName}`)
    .text(`Email: ${data.userEmail}`)
    .moveDown(0.8);

  // Divider
  doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).stroke();
  doc.moveDown(1);

  // Section: Экскурсия
  doc
    .font('Inter-Bold')
    .fontSize(13)
    .text('Данные экскурсии', { underline: true })
    .moveDown(0.5);

  doc
    .font('Inter-Regular')
    .fontSize(11)
    .text(`Название: ${data.excursionTitle}`)
    .text(`Предприятие: ${data.enterpriseName}`)
    .text(`Адрес: ${data.enterpriseAddress || 'Не указан'}`)
    .text(`Дата и время: ${data.excursionDate}`)
    .text(`Тип: ${data.excursionType === 'online' ? 'Онлайн' : 'Офлайн'}`)
    .moveDown(0.8);

  // Divider
  doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).stroke();
  doc.moveDown(1);

  // Section: Контакты
  doc
    .font('Inter-Bold')
    .fontSize(13)
    .text('Контактное лицо на предприятии', { underline: true })
    .moveDown(0.5);

  doc
    .font('Inter-Regular')
    .fontSize(11)
    .text(data.enterpriseContact || 'Не указан')
    .moveDown(1.5);

  // Footer
  doc
    .fontSize(8)
    .text(
      'Данное направление сформировано автоматически платформой «Вперёд по маршрутам промышленности».',
      { align: 'center', width: doc.page.width - 120 }
    )
    .moveDown(0.3);

  doc
    .fontSize(8)
    .text('При себе необходимо иметь документ, удостоверяющий личность.', { align: 'center', width: doc.page.width - 120 });

  doc.end();
}
