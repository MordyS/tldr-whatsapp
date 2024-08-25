# TL;DR WhatsApp Group Chats

This project helps generate concise summaries (TL;DR) of long chats in WhatsApp groups. It was created by Mordy Stern.

## Prerequisites

- **Node.js**: Make sure you have Node.js version 18 or higher installed. You can check your Node.js version with:

  ```bash
  node -v
  ```

- **API Key**: This project uses the OpenAI API. To use the API, you need an OpenAI API key.

  1. Go to [OpenAI's platform](https://platform.openai.com/docs/overview) to create an account and get your API key.
  2. Once you have your API key, proceed with the steps below.

## Setup Instructions

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/tldr-whatsapp.git
   cd tldr-whatsapp
   ```

2. **Create a `.env` file**:

   Create a file named `.env` in the root directory of your project and add your OpenAI API key:

   ```plaintext
   OPEN_AI_API_KEY=your_openai_api_key_here
   ```

   Replace `your_openai_api_key_here` with your actual OpenAI API key.

3. **Install dependencies**:

   Run the following command to install all necessary packages:

   ```bash
   npm install
   ```

4. **Start the application**:

   Start the application by running:

   ```bash
   npm start
   ```

   After running this command, a QR code will appear in the console.

5. **Scan the QR code with WhatsApp**:

   Open WhatsApp on your phone, go to **Settings > Linked Devices**, and scan the QR code displayed in your console. This will link your WhatsApp account to the application.

## Usage

Once linked, the application will monitor your WhatsApp group chats 

אם מישהו כותב בקבוצה כלשהי `אמלק 100` הבוט יאמלק את 100 ההודעות האחרונות, אפשר לכתוב כל מספר

אם כותבים רק `אמלק` בלי מספר, זה יאמלק 50 הודעות אחרונות


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
