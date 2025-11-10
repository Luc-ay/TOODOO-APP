import dotenv from 'dotenv'
dotenv.config()
import Sib from 'sib-api-v3-sdk'
import VerificationCode from '../models/Verify-user.js'

//Sendinblue client
const client = Sib.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.SENDINBLUE_API_KEY

const tranEmailApi = new Sib.TransactionalEmailsApi()

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString() // 6-digit code
}

export async function sendVerificationEmail(email, fullName) {
  try {
    await VerificationCode.findOneAndDelete({ email })

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // valid for 10 mins

    // Save to DB
    await VerificationCode.create({ email, code, expiresAt })

    // Prepare email
    const sender = {
      email: process.env.EMAIL_FROM,
      name: 'Your App Name',
    }

    console.log('Evrything is fine')
    const templateId = parseInt(process.env.SENDINBLUE_TEMPLATE_ID)

    // Send email using template
    await tranEmailApi.sendTransacEmail({
      sender: { email: process.env.EMAIL_FROM, name: 'Toodoo App' },
      to: [
        {
          email,
          name: fullName, // populates {{ contact.FIRSTNAME }}
        },
      ],
      templateId: parseInt(process.env.SENDINBLUE_TEMPLATE_ID),
      params: {
        FIRSTNAME: fullName, // for {{ params.FIRSTNAME }}
        CODE: code, // for {{ params.CODE }}
      },
    })

    console.log(`Verification email sent to ${email}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return { success: false, error: error.message }
  }
}
