import OpenAI from 'openai';

export const analyzeAndReply = async (comment, brandPersonality) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('กรุณาระบุ OpenAI API Key');
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // สำหรับสาธิตในฝั่ง Client
  });

  const personalityStr = brandPersonality || 'สุภาพ เป็นกันเอง และให้ความช่วยเหลืออย่างดีที่สุด';

  const prompt = `คุณคือ AI ผู้ช่วยแอดมินดูแลลูกค้า (Customer Service) สำหรับร้านค้าแบรนด์เฉพาะกลุ่ม (Niche Brand)
บุคลิกของแบรนด์และน้ำเสียงในการตอบคือ: "${personalityStr}"

ระบบส่งข้อความ (คอมเมนต์) จาก Social Media เข้ามาให้คุณ
จงวิเคราะห์คอมเมนต์ของลูกค้าด้านล่างนี้
1. ประเมินอารมณ์ (Sentiment) ของลูกค้า (เลือก: Positive, Negative, หรือ Neutral)
2. ร่างข้อความตอบกลับ (Draft Reply) เป็นภาษาไทย โดยใช้น้ำเสียงตามบุคลิกของแบรนด์

ตอบกลับมาในรูปแบบ JSON ที่มี key ดังนี้เท่านั้น:
{
  "sentiment": "Positive" | "Negative" | "Neutral",
  "draftReply": "ข้อความร่างของคุณ..."
}

คอมเมนต์ลูกค้า: "${comment}"
`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('ไม่สามารถเชื่อมต่อกับ OpenAI API ได้ กรุณาตรวจสอบ API Key หรือลองใหม่อีกครั้ง');
  }
};
