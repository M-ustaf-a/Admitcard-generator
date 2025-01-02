import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { phone, message, image } = await req.json();

    // Validate inputs
    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // WhatsApp Business API configuration
    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
    const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const version = 'v17.0'; // Meta API version

    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      console.error('WhatsApp credentials not configured');
      return NextResponse.json(
        { error: 'WhatsApp integration not configured' },
        { status: 500 }
      );
    }

    // First, upload the image to get a handle
    let imageHandle;
    if (image) {
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(image.split(',')[1], 'base64');

      const formData = new FormData();
      formData.append('file', new Blob([imageBuffer], { type: 'image/png' }));
      formData.append('messaging_product', 'whatsapp');
      
      const uploadResponse = await fetch(
        `https://graph.facebook.com/${version}/${WHATSAPP_PHONE_NUMBER_ID}/media`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          },
          body: formData
        }
      );

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadResult = await uploadResponse.json();
      imageHandle = uploadResult.id;
    }

    // Prepare the WhatsApp message payload
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: "template",
      template: {
        name: "admit_card", // You need to create this template in WhatsApp Business Manager
        language: {
          code: "en"
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: message
              }
            ]
          }
        ]
      }
    };

    // If we have an image, add it to the message
    if (imageHandle) {
      payload.template.components.push({
        type: "header",
        parameters: [
          {
            type: "image",
            image: {
              id: imageHandle
            }
          }
        ]
      });
    }

    // Send the message
    const response = await fetch(
      `https://graph.facebook.com/${version}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`WhatsApp API error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();

    // Log the successful sending (you might want to store this in a database)
    console.log('WhatsApp message sent successfully:', result);

    return NextResponse.json({ success: true, messageId: result.messages[0].id });

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json(
      { error: 'Failed to send WhatsApp message' },
      { status: 500 }
    );
  }
}