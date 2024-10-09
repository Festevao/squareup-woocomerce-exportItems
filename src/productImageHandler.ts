import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

export const uploadImageFromURL = async (imageUrl: string): Promise<string> => {
  try {
    const imageResponse = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'arraybuffer',
    });

    const contentType = imageResponse.headers['content-type'];
    const extension = contentType.split('/')[1];

    const wpResponse = await axios.post(
      `${process.env.WP_URL}/wp-json/wp/v2/media`,
      imageResponse.data,
      {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="image.${extension}"`,
          Authorization: `Basic ${Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64')}`,
        },
      }
    );

    return wpResponse.data.source_url;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw error;
  }
}
