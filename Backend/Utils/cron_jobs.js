import cron from "node-cron";
import { Op } from "sequelize";
import Tender from "../Models/tenders.js";

// This function starts a cron job that runs every minute to check for expired tenders and close them
export const startTenderDeadlineChecker = () => {
  // Run every 3 minutes: */3 * * * *
  cron.schedule("*/3 * * * *", async () => {
    try {
      console.log("[Cron Job] Checking for expired tender deadlines...");
      
      const now = new Date();

      // Find all tenders where status is 'open' and deadline is less than or equal to now
      const expiredTenders = await Tender.update(
        { status: "closed" },
        {
          where: {
            status: "open",
            deadline: {
              [Op.lte]: now,
            },
          },
        }
      );

      if (expiredTenders[0] > 0) {
        console.log(`[Cron Job] Successfully closed ${expiredTenders[0]} expired tenders.`);
      }
    } catch (error) {
      console.error("[Cron Job] Error while checking tender deadlines:", error);
    }
  });
};
