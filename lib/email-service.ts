interface SendEmailParams {
  to: string
  subject: string
  firstName: string
  lastName: string
  reservationDate: string
  attractions: Array<{
    name: string
    price: number
  }>
  totalPrice: number
  confirmationCode?: string
}

export const sendConfirmationEmail = async ({
  to,
  subject,
  firstName,
  lastName,
  reservationDate,
  attractions,
  totalPrice,
  confirmationCode,
}: SendEmailParams): Promise<{ success: boolean; message: string }> => {
  try {
    // In a real application, you would send this via an email service
    // For now, we'll just simulate the API call with a delay

    // Generate a simple HTML email (without using React components)
    const emailHtml = generateEmailHtml({
      firstName,
      lastName,
      reservationDate,
      attractions,
      totalPrice,
      confirmationCode: confirmationCode || generateConfirmationCode(),
    })

    console.log(`Sending email to: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Email content: ${emailHtml.substring(0, 100)}...`)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return success response
    return {
      success: true,
      message: `Email sent successfully to ${to}`,
    }
  } catch (error) {
    console.error("Error sending email:", error)
    return {
      success: false,
      message: `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Helper function to generate a confirmation code
export const generateConfirmationCode = (): string => {
  return (
    "BR" +
    Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")
  )
}

// Helper function to generate HTML email content
function generateEmailHtml({
  firstName,
  lastName,
  reservationDate,
  attractions,
  totalPrice,
  confirmationCode,
}: Omit<SendEmailParams, "to" | "subject">): string {
  // Create attraction rows
  const attractionRows = attractions
    .map(
      (attraction) => `
      <tr>
        <td style="border-bottom: 1px solid #eeeeee">${attraction.name}</td>
        <td style="text-align: right; border-bottom: 1px solid #eeeeee">$${attraction.price.toFixed(2)}</td>
      </tr>
    `,
    )
    .join("")

  // Return HTML template as a string
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <table width="100%" cellPadding="0" cellSpacing="0" style="background-color: #ffffff">
        <tr>
          <td style="padding: 20px; background-color: #ff8a00; text-align: center">
            <h1 style="color: white; margin: 0; font-size: 24px">BouncyRent</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px 20px">
            <h2 style="color: #333333; margin-top: 0">Reservation Confirmation</h2>
            <p style="color: #666666; line-height: 1.5">
              Dear ${firstName} ${lastName},
            </p>
            <p style="color: #666666; line-height: 1.5">
              Thank you for choosing BouncyRent! We're excited to confirm your reservation for ${reservationDate}.
            </p>
            <p style="color: #666666; line-height: 1.5">
              Your confirmation code is: <strong>${confirmationCode}</strong>
            </p>

            <div style="margin: 30px 0; background-color: #f9f9f9; padding: 15px; border-radius: 5px">
              <h3 style="color: #333333; margin-top: 0">Reservation Details</h3>
              <table width="100%" cellPadding="8" cellSpacing="0" style="border-collapse: collapse">
                <tr>
                  <th style="text-align: left; border-bottom: 1px solid #eeeeee">Item</th>
                  <th style="text-align: right; border-bottom: 1px solid #eeeeee">Price</th>
                </tr>
                ${attractionRows}
                <tr>
                  <td style="font-weight: bold; padding-top: 15px">Total</td>
                  <td style="text-align: right; font-weight: bold; padding-top: 15px">
                    $${totalPrice.toFixed(2)}
                  </td>
                </tr>
              </table>
            </div>

            <p style="color: #666666; line-height: 1.5">
              We will contact you shortly to discuss payment options and confirm the final details of your reservation.
            </p>

            <p style="color: #666666; line-height: 1.5">
              If you have any questions or need to make changes to your reservation, please contact us at:
            </p>
            <p style="color: #666666; line-height: 1.5">
              <strong>Email:</strong> support@bouncyrent.com
              <br />
              <strong>Phone:</strong> (555) 123-4567
            </p>
          </td>
        </tr>
        <tr>
          <td
            style="
              padding: 20px;
              background-color: #f5f5f5;
              text-align: center;
              color: #999999;
              font-size: 12px;
            "
          >
            <p>&copy; 2023 BouncyRent. All rights reserved.</p>
            <p>123 Bounce Street, Funtown, CA 12345</p>
          </td>
        </tr>
      </table>
    </div>
  `
}
