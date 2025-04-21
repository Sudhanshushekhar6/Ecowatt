// const cron = require("node-cron");
// const { initializeApp } = require("firebase/app");
// const {
//   getFirestore,
//   collection,
//   addDoc,
//   getDocs,
//   query,
//   where,
// } = require("firebase/firestore");
// const { initializeApp: adminInit } = require("firebase-admin/app");
// const { getAuth } = require("firebase-admin/auth");
// const path = require("path");
// const { Resend } = require("resend");
// require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

// const resend = new Resend(process.env.RESEND_API_KEY);

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// };
// initializeApp(firebaseConfig);

// adminInit({
//   credential: require("firebase-admin").credential.cert(
//     require("../serviceAccountKey.json"),
//   ),
// });

// const db = getFirestore();
// const auth = getAuth();

// const baseTouRates = {
//   DOMESTIC: [
//     { startHour: 0, endHour: 4, baseRate: 3.0, variation: 0.3 },
//     { startHour: 4, endHour: 8, baseRate: 4.5, variation: 0.4 },
//     { startHour: 8, endHour: 12, baseRate: 6.5, variation: 0.5 },
//     { startHour: 12, endHour: 16, baseRate: 7.0, variation: 0.6 },
//     { startHour: 16, endHour: 20, baseRate: 8.0, variation: 0.7 },
//     { startHour: 20, endHour: 24, baseRate: 5.2, variation: 0.4 },
//   ],
//   INDUSTRIAL: [{ startHour: 0, endHour: 24, baseRate: 7.75, variation: 0.5 }],
//   NON_DOMESTIC: [{ startHour: 0, endHour: 24, baseRate: 8.5, variation: 0.6 }],
// };

// const SEASON_MULTIPLIER = { SUMMER: 1.15, WINTER: 0.9, MONSOON: 1.0 };
// const DEMAND_MULTIPLIER = { WEEKDAY: 1.1, WEEKEND: 0.95 };
// const SURCHARGES = { ACCUMULATED_DEFICIT: 1.08, PENSION_TRUST: 1.05 };
// // Setting threshold to 4.0 as requested
// const RATE_THRESHOLD = 4.0;

// function getCurrentSeason() {
//   const month = new Date().getMonth();
//   if (month >= 3 && month <= 5) return "SUMMER";
//   if (month >= 6 && month <= 9) return "MONSOON";
//   return "WINTER";
// }

// function generateRandomVariation(baseVariation) {
//   const u1 = Math.random();
//   const u2 = Math.random();
//   const normalRandom =
//     Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
//   return normalRandom * baseVariation;
// }

// function getCurrentTOURate(category) {
//   const now = new Date();
//   const currentHour = now.getHours();
//   const isWeekend = now.getDay() === 0 || now.getDay() === 6;
//   const currentSeason = getCurrentSeason();

//   const currentRateConfig = baseTouRates[category].find(
//     (rate) => currentHour >= rate.startHour && currentHour < rate.endHour,
//   );
//   if (!currentRateConfig) return 5.0;

//   let rate = currentRateConfig.baseRate;
//   rate += generateRandomVariation(currentRateConfig.variation);
//   rate *= SEASON_MULTIPLIER[currentSeason];
//   rate *= isWeekend ? DEMAND_MULTIPLIER.WEEKEND : DEMAND_MULTIPLIER.WEEKDAY;
//   rate *= SURCHARGES.ACCUMULATED_DEFICIT;
//   rate *= SURCHARGES.PENSION_TRUST;

//   // With threshold at 4.0, most rates will trigger notifications
//   return Math.round(rate * 100) / 100;
// }

// // Fetch users who have opted for email notifications
// async function fetchUsersWithEmailNotifications() {
//   try {
//     const usersCollection = collection(db, "users");
//     const querySnapshot = await getDocs(
//       query(usersCollection, where("notificationMethod", "==", "email"))
//     );

//     const users = [];
//     const authPromises = [];
    
//     console.log(`Found ${querySnapshot.size} users with email notifications enabled`);
    
//     // Create a batch of promises to fetch user emails
//     for (const doc of querySnapshot.docs) {
//       const userId = doc.id;
//       const userData = doc.data();
      
//       // If user already has email in Firestore, use that instead of querying Auth
//       if (userData.email) {
//         users.push({ id: userId, email: userData.email, ...userData });
//         console.log(`User ${userId} has email stored in Firestore: ${userData.email}`);
//       } else {
//         authPromises.push(
//           auth.getUser(userId)
//             .then(userRecord => {
//               if (userRecord.email) {
//                 users.push({ id: userId, email: userRecord.email, ...userData });
//                 console.log(`Retrieved email for user ${userId}: ${userRecord.email}`);
//               } else {
//                 console.log(`User ${userId} has no email in Auth`);
//               }
//               return null;
//             })
//             .catch(error => {
//               console.error(`Failed to fetch email for user ID ${userId}:`, error);
//               return null;
//             })
//         );
//       }
//     }
    
//     // Wait for all auth queries to complete
//     await Promise.all(authPromises);
//     console.log(`Total users with valid emails: ${users.length}`);
//     return users;
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     return [];
//   }
// }

// // Send email alerts to users in batches
// async function sendEmailToUsers(users, rate, category) {
//   // Process in batches of 20 to avoid rate limiting
//   const batchSize = 20;
  
//   console.log(`Attempting to send emails to ${users.length} users`);
  
//   for (let i = 0; i < users.length; i += batchSize) {
//     const batch = users.slice(i, i + batchSize);
//     const emailPromises = batch.map(user => {
//       console.log(`Preparing email for: ${user.email}`);
      
//       return resend.emails.send({
//         from: "Energy Alerts <ramekwalsingh449@gmail.com>", // Updated sender email
//         to: [user.email],
//         subject: `High ${category} Tariff Rate Alert: ₹${rate.toFixed(2)}`,
//         html: `
//           <p>Dear User,</p>
//           <p>The current ${category} tariff rate has reached <b>₹${rate.toFixed(2)}</b>, which is higher than our normal threshold of ₹${RATE_THRESHOLD.toFixed(2)}.</p>
//           <p>Consider adjusting your electricity usage during this period to save on costs.</p>
//           <br>
//           <p>For more information, please visit <a href="https://prabhawatt.vercel.app/">PrabhaWatt Portal</a></p>
//           <p>If you wish to stop receiving these notifications, please update your preferences in your account settings.</p>
//         `,
//       })
//       .then(response => {
//         console.log(`Email sent to ${user.email}, ID: ${response.id}`);
//         return response;
//       })
//       .catch(error => {
//         console.error(`Failed to send email to ${user.email}:`, error);
//         console.error(`Error details:`, JSON.stringify(error, null, 2));
//         throw error;
//       });
//     });
    
//     try {
//       const results = await Promise.allSettled(emailPromises);
//       const successful = results.filter(r => r.status === 'fulfilled').length;
//       const failed = results.filter(r => r.status === 'rejected').length;
//       console.log(`Batch ${i/batchSize + 1} complete: ${successful} emails sent, ${failed} failed`);
//     } catch (error) {
//       console.error("Error sending batch of emails:", error);
//     }
    
//     // Add a small delay between batches to avoid overwhelming the email service
//     if (i + batchSize < users.length) {
//       await new Promise(resolve => setTimeout(resolve, 2000));
//     }
//   }
// }

// // Add a test user function to ensure there's at least one user to receive notifications
// async function addTestUserIfNeeded(email) {
//   try {
//     // Check if the email already exists
//     const usersCollection = collection(db, "users");
//     const querySnapshot = await getDocs(
//       query(usersCollection, where("email", "==", email))
//     );
    
//     if (querySnapshot.empty) {
//       // Email doesn't exist, add the user
//       await addDoc(usersCollection, {
//         email: email,
//         notificationMethod: "email",
//         createdAt: new Date().toISOString()
//       });
//       console.log(`Test user added with email: ${email}`);
//     } else {
//       console.log(`User with email ${email} already exists`);
//     }
//   } catch (error) {
//     console.error("Error managing test user:", error);
//   }
// }

// // Generate and store TOU data for a given category
// async function generateAndStoreTOUData(category) {
//   try {
//     const currentRate = getCurrentTOURate(category);
//     const timestamp = new Date().toISOString();

//     // Store the TOU rate in Firestore
//     const touCollection = collection(db, "tou-rates");
//     await addDoc(touCollection, { category, rate: currentRate, timestamp });
//     console.log(`Stored ${category} TOU rate: ${currentRate} at ${timestamp}`);

//     // Send notifications if rate exceeds threshold
//     if (currentRate > RATE_THRESHOLD) {
//       console.log(`High rate detected for ${category} (${currentRate} > ${RATE_THRESHOLD}). Sending notifications...`);
//       const users = await fetchUsersWithEmailNotifications();
      
//       if (users.length > 0) {
//         await sendEmailToUsers(users, currentRate, category);
//         console.log(`Notifications sent to ${users.length} users for ${category} rate`);
//       } else {
//         console.log("No users found with email notifications enabled");
//       }
//     } else {
//       console.log(`${category} rate (${currentRate}) is below notification threshold (${RATE_THRESHOLD})`);
//     }
//   } catch (error) {
//     console.error(`Error processing ${category} TOU data:`, error);
//   }
// }

// // Function to send a direct test email with enhanced error handling
// async function sendDirectTestEmail(email) {
//   try {
//     console.log(`Attempting to send direct test email to ${email}...`);
//     console.log(`Using Resend API key: ${process.env.RESEND_API_KEY ? "Key is set (first 4 chars: " + process.env.RESEND_API_KEY.substring(0, 4) + "...)" : "NOT SET!"}`);
    
//     const testCategory = "DOMESTIC";
//     const testRate = 5.75; // A rate above threshold
    
//     const result = await resend.emails.send({
//       from: "Energy Alerts <ramekwalsingh449@gmail.com>", // Updated sender email
//       to: [email],
//       subject: `TEST - High ${testCategory} Tariff Rate Alert: ₹${testRate.toFixed(2)}`,
//       html: `
//         <p>Dear User,</p>
//         <p>This is a TEST email. The current ${testCategory} tariff rate would be <b>₹${testRate.toFixed(2)}</b>, which is higher than our normal threshold of ₹${RATE_THRESHOLD.toFixed(2)}.</p>
//         <p>This email confirms that your notification system is working correctly.</p>
//         <p>Sent at: ${new Date().toISOString()}</p>
//         <br>
//         <p>For more information, please visit <a href="https://prabhawatt.vercel.app/">PrabhaWatt Portal</a></p>
//       `,
//     });
    
//     console.log(`Test email response details:`, JSON.stringify(result, null, 2));
//     console.log(`Test email sent successfully to ${email}, ID: ${result.id}`);
//     return true;
//   } catch (error) {
//     console.error(`Failed to send test email to ${email}:`, error);
//     console.error(`Error details:`, JSON.stringify(error, null, 2));
//     return false;
//   }
// }

// // Ensure notifications work by forcing a high rate
// async function sendTestNotification(email) {
//   try {
//     // First try direct email approach
//     const directEmailSent = await sendDirectTestEmail(email);
    
//     if (!directEmailSent) {
//       console.log("Direct email failed, trying database approach...");
//       // Ensure the test user exists
//       await addTestUserIfNeeded(email);
      
//       // Force a high rate
//       const testCategory = "DOMESTIC";
//       const testRate = RATE_THRESHOLD + 1;  // Ensure it's above threshold
      
//       console.log(`TEST: Simulating high ${testCategory} rate: ${testRate}`);
//       const users = await fetchUsersWithEmailNotifications();
      
//       if (users.length > 0) {
//         await sendEmailToUsers(users, testRate, testCategory);
//         console.log(`TEST: Notifications sent to ${users.length} users`);
//       } else {
//         console.log("TEST: No users found with email notifications enabled");
//       }
//     }
//   } catch (error) {
//     console.error("Error in test notification:", error);
//   }
// }

// // Check if required configurations are present
// function checkConfiguration() {
//   if (!process.env.RESEND_API_KEY) {
//     console.error("RESEND_API_KEY is not configured in .env.local");
//     return false;
//   }
  
//   try {
//     require("../serviceAccountKey.json");
//   } catch (error) {
//     console.error("serviceAccountKey.json is missing or invalid", error);
//     return false;
//   }
  
//   return true;
// }

// // Main function that runs the cron job
// function startTOUDataGeneration(testEmail = null) {
//   if (!checkConfiguration()) {
//     console.error("Aborting TOU data generation due to missing configuration");
//     return;
//   }
  
//   console.log("Background process for TOU data generation started");
  
//   // If test email is provided, send test notification
//   if (testEmail) {
//     console.log(`Setup complete! Sending test email to ${testEmail}...`);
//     setTimeout(() => sendTestNotification(testEmail), 3000);
//   }
  
//   // Run every hour at minute 0
//   cron.schedule("0 * * * *", async () => {
//     try {
//       console.log(`Running TOU data generation at ${new Date().toISOString()}`);
      
//       // Process categories sequentially to avoid Firebase concurrency issues
//       for (const category of ["DOMESTIC", "INDUSTRIAL", "NON_DOMESTIC"]) {
//         await generateAndStoreTOUData(category);
//       }
      
//       console.log("TOU data generation completed successfully");
//     } catch (error) {
//       console.error("Error in TOU data generation cron job:", error);
//     }
//   });
  
//   console.log(`TOU rate threshold set to ${RATE_THRESHOLD}. Emails will be sent when rates exceed this value.`);
// }

// // Create a simple test function that just adds the test user and sends a test email
// async function runSimpleEmailTest() {
//   console.log("Starting simple email test...");
  
//   // Recipient email address
//   const recipientEmail = "kumarsudhanshu994@gmail.com";
  
//   // Add the user to the database
//   await addTestUserIfNeeded(recipientEmail);
  
//   // Send direct test email
//   await sendDirectTestEmail(recipientEmail);
  
//   console.log("Simple email test completed");
// }

// // Uncomment one of these options:

// // Option 1: Start the full TOU generation process with test email
// startTOUDataGeneration("kumarsudhanshu994@gmail.com");

// // Option 2: Run just a simple email test (may be more reliable for testing)
// // runSimpleEmailTest();
const cron = require("node-cron");
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
} = require("firebase/firestore");
const { initializeApp: adminInit } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const path = require("path");
const { Resend } = require("resend");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

// Initialize Resend for email
const resend = new Resend(process.env.RESEND_API_KEY);

// Your email for testing - REPLACE WITH YOUR ACTUAL EMAIL
const YOUR_EMAIL = "your-email@gmail.com"; 

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
initializeApp(firebaseConfig);

// Initialize Firebase Admin
adminInit({
  credential: require("firebase-admin").credential.cert(
    require("../serviceAccountKey.json"),
  ),
});

const db = getFirestore();
const auth = getAuth();

const baseTouRates = {
  DOMESTIC: [
    { startHour: 0, endHour: 4, baseRate: 3.0, variation: 0.3 },
    { startHour: 4, endHour: 8, baseRate: 4.5, variation: 0.4 },
    { startHour: 8, endHour: 12, baseRate: 6.5, variation: 0.5 },
    { startHour: 12, endHour: 16, baseRate: 7.0, variation: 0.6 },
    { startHour: 16, endHour: 20, baseRate: 8.0, variation: 0.7 },
    { startHour: 20, endHour: 24, baseRate: 5.2, variation: 0.4 },
  ],
  INDUSTRIAL: [{ startHour: 0, endHour: 24, baseRate: 7.75, variation: 0.5 }],
  NON_DOMESTIC: [{ startHour: 0, endHour: 24, baseRate: 8.5, variation: 0.6 }],
};

const SEASON_MULTIPLIER = { SUMMER: 1.15, WINTER: 0.9, MONSOON: 1.0 };
const DEMAND_MULTIPLIER = { WEEKDAY: 1.1, WEEKEND: 0.95 };
const SURCHARGES = { ACCUMULATED_DEFICIT: 1.08, PENSION_TRUST: 1.05 };
// Setting threshold to 4.0 as requested
const RATE_THRESHOLD = 4.0;

function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 3 && month <= 5) return "SUMMER";
  if (month >= 6 && month <= 9) return "MONSOON";
  return "WINTER";
}

function generateRandomVariation(baseVariation) {
  const u1 = Math.random();
  const u2 = Math.random();
  const normalRandom =
    Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return normalRandom * baseVariation;
}

function getCurrentTOURate(category) {
  const now = new Date();
  const currentHour = now.getHours();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const currentSeason = getCurrentSeason();

  const currentRateConfig = baseTouRates[category].find(
    (rate) => currentHour >= rate.startHour && currentHour < rate.endHour,
  );
  if (!currentRateConfig) return 5.0;

  let rate = currentRateConfig.baseRate;
  rate += generateRandomVariation(currentRateConfig.variation);
  rate *= SEASON_MULTIPLIER[currentSeason];
  rate *= isWeekend ? DEMAND_MULTIPLIER.WEEKEND : DEMAND_MULTIPLIER.WEEKDAY;
  rate *= SURCHARGES.ACCUMULATED_DEFICIT;
  rate *= SURCHARGES.PENSION_TRUST;

  return Math.round(rate * 100) / 100;
}

// Add test user to the database
async function addTestUser(email) {
  try {
    console.log(`Checking if user with email ${email} exists...`);
    
    // Check if user already exists
    const usersCollection = collection(db, "users");
    const querySnapshot = await getDocs(
      query(usersCollection, where("email", "==", email))
    );
    
    if (querySnapshot.empty) {
      // User doesn't exist, add them
      const docRef = await addDoc(usersCollection, {
        email: email,
        notificationMethod: "email",
        createdAt: new Date().toISOString()
      });
      console.log(`✅ Test user added with email: ${email}, ID: ${docRef.id}`);
    } else {
      console.log(`✅ User with email ${email} already exists in database`);
    }
    return true;
  } catch (error) {
    console.error("❌ Error adding test user:", error);
    return false;
  }
}

// Send a direct test email to verify configuration
async function sendDirectTestEmail(email) {
  try {
    console.log(`Sending direct test email to ${email}...`);
    
    const response = await resend.emails.send({
      from: "kumarsudhanshu994@gmail.com", // Using Resend's default domain
      to: [email],
      subject: "PrabhaWatt Email Notification Test",
      html: `
        <h2>Email Notification Test</h2>
        <p>Dear User,</p>
        <p>This is a test email to verify that your PrabhaWatt notification system is working correctly.</p>
        <p>If you're receiving this email, your email notification setup is functioning properly!</p>
        <br>
        <p><b>Configuration Details:</b></p>
        <ul>
          <li>Rate Threshold: ₹${RATE_THRESHOLD.toFixed(2)}</li>
          <li>Current Time: ${new Date().toLocaleString()}</li>
        </ul>
        <br>
        <p>For more information, please visit <a href="https://prabhawatt.vercel.app/">PrabhaWatt Portal</a></p>
      `,
    });
    
    console.log(`✅ Test email sent successfully! Email ID: ${response.id}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending test email:", error);
    console.error("Error details:", error.message);
    return false;
  }
}

// Fetch users who have opted for email notifications
async function fetchUsersWithEmailNotifications() {
  try {
    const usersCollection = collection(db, "users");
    const querySnapshot = await getDocs(
      query(usersCollection, where("notificationMethod", "==", "email"))
    );

    const users = [];
    const authPromises = [];
    
    console.log(`Found ${querySnapshot.size} users with email notifications enabled`);
    
    // Create a batch of promises to fetch user emails
    for (const doc of querySnapshot.docs) {
      const userId = doc.id;
      const userData = doc.data();
      
      // If user already has email in Firestore, use that instead of querying Auth
      if (userData.email) {
        users.push({ id: userId, email: userData.email, ...userData });
        console.log(`User ${userId} has email stored in Firestore: ${userData.email}`);
      } else {
        authPromises.push(
          auth.getUser(userId)
            .then(userRecord => {
              if (userRecord.email) {
                users.push({ id: userId, email: userRecord.email, ...userData });
                console.log(`Retrieved email for user ${userId}: ${userRecord.email}`);
              } else {
                console.log(`User ${userId} has no email in Auth`);
              }
              return null;
            })
            .catch(error => {
              console.error(`Failed to fetch email for user ID ${userId}:`, error);
              return null;
            })
        );
      }
    }
    
    // Wait for all auth queries to complete
    await Promise.all(authPromises);
    console.log(`Total users with valid emails: ${users.length}`);
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// Send email alerts to users in batches
async function sendEmailToUsers(users, rate, category) {
  // Process in batches of 20 to avoid rate limiting
  const batchSize = 20;
  
  console.log(`Attempting to send emails to ${users.length} users`);
  
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    const emailPromises = batch.map(user => {
      console.log(`Preparing email for: ${user.email}`);
      
      return resend.emails.send({
        from: "raushan0785@gmail.com", // Using Resend's default domain
        to: [user.email],
        subject: `High ${category} Tariff Rate Alert: ₹${rate.toFixed(2)}`,
        html: `
          <p>Dear User,</p>
          <p>The current ${category} tariff rate has reached <b>₹${rate.toFixed(2)}</b>, which is higher than our normal threshold of ₹${RATE_THRESHOLD.toFixed(2)}.</p>
          <p>Consider adjusting your electricity usage during this period to save on costs.</p>
          <br>
          <p>For more information, please visit <a href="https://prabhawatt.vercel.app/">PrabhaWatt Portal</a></p>
          <p>If you wish to stop receiving these notifications, please update your preferences in your account settings.</p>
        `,
      })
      .then(response => {
        console.log(`✅ Email sent to ${user.email}, ID: ${response.id}`);
        return response;
      })
      .catch(error => {
        console.error(`❌ Failed to send email to ${user.email}:`, error);
        throw error;
      });
    });
    
    try {
      const results = await Promise.allSettled(emailPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      console.log(`Batch ${i/batchSize + 1} complete: ${successful} emails sent, ${failed} failed`);
    } catch (error) {
      console.error("Error sending batch of emails:", error);
    }
    
    // Add a small delay between batches to avoid overwhelming the email service
    if (i + batchSize < users.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Generate and store TOU data for a given category
async function generateAndStoreTOUData(category) {
  try {
    const currentRate = getCurrentTOURate(category);
    const timestamp = new Date().toISOString();

    // Store the TOU rate in Firestore
    const touCollection = collection(db, "tou-rates");
    await addDoc(touCollection, { category, rate: currentRate, timestamp });
    console.log(`Stored ${category} TOU rate: ${currentRate} at ${timestamp}`);

    // Send notifications if rate exceeds threshold
    if (currentRate > RATE_THRESHOLD) {
      console.log(`High rate detected for ${category} (${currentRate} > ${RATE_THRESHOLD}). Sending notifications...`);
      const users = await fetchUsersWithEmailNotifications();
      
      if (users.length > 0) {
        await sendEmailToUsers(users, currentRate, category);
        console.log(`Notifications sent to ${users.length} users for ${category} rate`);
      } else {
        console.log("No users found with email notifications enabled");
      }
    } else {
      console.log(`${category} rate (${currentRate}) is below notification threshold (${RATE_THRESHOLD})`);
    }
  } catch (error) {
    console.error(`Error processing ${category} TOU data:`, error);
  }
}

// Check if required configurations are present
function checkConfiguration() {
  console.log("Checking configuration...");
  
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is not configured in .env.local");
    return false;
  } else {
    console.log("✅ RESEND_API_KEY is configured");
  }
  
  try {
    require("../serviceAccountKey.json");
    console.log("✅ serviceAccountKey.json is valid");
  } catch (error) {
    console.error("❌ serviceAccountKey.json is missing or invalid", error);
    return false;
  }
  
  return true;
}

// Main function to run the full test
async function runEmailTest(email) {
  console.log("=========================================");
  console.log("🔍 STARTING EMAIL NOTIFICATION TEST");
  console.log("=========================================");
  
  // Check configuration
  if (!checkConfiguration()) {
    console.error("❌ Configuration check failed. Please fix issues before continuing.");
    return;
  }
  
  // Add test user
  const userAdded = await addTestUser(email);
  if (!userAdded) {
    console.error("❌ Failed to add test user. Email notifications may not work.");
  }
  
  // Send direct test email
  const emailSent = await sendDirectTestEmail(email);
  if (!emailSent) {
    console.error("❌ Failed to send direct test email. Please check your Resend API key and configuration.");
  } else {
    console.log("✅ Direct test email sent successfully!");
  }
  
  // Test notification through the regular flow
  console.log("\n🔍 Testing notification through regular flow...");
  try {
    const testCategory = "DOMESTIC";
    const testRate = 9.5; // Force high rate for testing
    
    console.log(`Simulating high ${testCategory} rate: ${testRate}`);
    
    // Get all users with email notifications
    const users = await fetchUsersWithEmailNotifications();
    
    if (users.length > 0) {
      await sendEmailToUsers(users, testRate, testCategory);
      console.log(`✅ Regular notification flow test completed. Emails sent to ${users.length} users.`);
    } else {
      console.error("❌ No users found for regular notification flow test. This is unexpected since we just added a test user.");
    }
  } catch (error) {
    console.error("❌ Error in regular notification flow test:", error);
  }
  
  console.log("\n=========================================");
  console.log("📧 EMAIL TEST SUMMARY");
  console.log("=========================================");
  console.log(`Test email: ${email}`);
  console.log("If you received the test emails, your notification system is working correctly!");
  console.log("Check both your inbox and spam folder for emails from 'PrabhaWatt Energy'");
  console.log("=========================================");
}

// Start the test with your email
// REPLACE THIS WITH YOUR ACTUAL EMAIL
runEmailTest(YOUR_EMAIL).then(() => {
  console.log("\nStarting regular TOU data generation cron job...");
  
  // Set up the regular cron job
  cron.schedule("0 * * * *", async () => {
    try {
      console.log(`Running TOU data generation at ${new Date().toISOString()}`);
      
      // Process categories sequentially to avoid Firebase concurrency issues
      for (const category of ["DOMESTIC", "INDUSTRIAL", "NON_DOMESTIC"]) {
        await generateAndStoreTOUData(category);
      }
      
      console.log("TOU data generation completed successfully");
    } catch (error) {
      console.error("Error in TOU data generation cron job:", error);
    }
  });
});