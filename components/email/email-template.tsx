import type React from "react"
;('"use client')

interface EmailTemplateProps {
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

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  firstName,
  lastName,
  reservationDate,
  attractions,
  totalPrice,
  confirmationCode,
}) => {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: "#ffffff" }}>
        <tbody>
          <tr>
            <td style={{ padding: "20px", backgroundColor: "#ff8a00", textAlign: "center" }}>
              <h1 style={{ color: "white", margin: 0, fontSize: "24px" }}>BouncyRent</h1>
            </td>
          </tr>
          <tr>
            <td style={{ padding: "30px 20px" }}>
              <h2 style={{ color: "#333333", marginTop: 0 }}>Reservation Confirmation</h2>
              <p style={{ color: "#666666", lineHeight: 1.5 }}>
                Dear {firstName} {lastName},
              </p>
              <p style={{ color: "#666666", lineHeight: 1.5 }}>
                Thank you for choosing BouncyRent! We're excited to confirm your reservation for {reservationDate}.
              </p>
              <p style={{ color: "#666666", lineHeight: 1.5 }}>
                Your confirmation code is: <strong>{confirmationCode}</strong>
              </p>

              <div style={{ margin: "30px 0", backgroundColor: "#f9f9f9", padding: "15px", borderRadius: "5px" }}>
                <h3 style={{ color: "#333333", marginTop: 0 }}>Reservation Details</h3>
                <table width="100%" cellPadding="8" cellSpacing="0" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", borderBottom: "1px solid #eeeeee" }}>Item</th>
                      <th style={{ textAlign: "right", borderBottom: "1px solid #eeeeee" }}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attractions.map((attraction, index) => (
                      <tr key={index}>
                        <td style={{ borderBottom: "1px solid #eeeeee" }}>{attraction.name}</td>
                        <td style={{ textAlign: "right", borderBottom: "1px solid #eeeeee" }}>
                          ${attraction.price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{ fontWeight: "bold", paddingTop: "15px" }}>Total</td>
                      <td style={{ textAlign: "right", fontWeight: "bold", paddingTop: "15px" }}>
                        ${totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p style={{ color: "#666666", lineHeight: 1.5 }}>
                We will contact you shortly to discuss payment options and confirm the final details of your
                reservation.
              </p>

              <p style={{ color: "#666666", lineHeight: 1.5 }}>
                If you have any questions or need to make changes to your reservation, please contact us at:
              </p>
              <p style={{ color: "#666666", lineHeight: 1.5 }}>
                <strong>Email:</strong> support@bouncyrent.com
                <br />
                <strong>Phone:</strong> (555) 123-4567
              </p>
            </td>
          </tr>
          <tr>
            <td
              style={{
                padding: "20px",
                backgroundColor: "#f5f5f5",
                textAlign: "center",
                color: "#999999",
                fontSize: "12px",
              }}
            >
              <p>&copy; 2023 BouncyRent. All rights reserved.</p>
              <p>123 Bounce Street, Funtown, CA 12345</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
