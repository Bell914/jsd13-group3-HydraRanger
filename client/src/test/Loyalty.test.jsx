import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  calculateRankFromSpending,
  calculateProgress,
  getRankTheme,
  RANK_THRESHOLDS,
  MEMBERSHIP_RANKS
} from "../utils/loyaltyUtils.js";
import { MembershipCard } from "../pages/profilepage/MembershipCard.jsx";

describe("Membership Rank & Loyalty Program", () => {
  describe("loyaltyUtils calculation", () => {
    it("correctly determines membership ranks across spending thresholds", () => {
      expect(calculateRankFromSpending(0)).toBe(MEMBERSHIP_RANKS.MEMBER);
      expect(calculateRankFromSpending(999)).toBe(MEMBERSHIP_RANKS.MEMBER);
      expect(calculateRankFromSpending(1000)).toBe(MEMBERSHIP_RANKS.BRONZE);
      expect(calculateRankFromSpending(2999)).toBe(MEMBERSHIP_RANKS.BRONZE);
      expect(calculateRankFromSpending(3000)).toBe(MEMBERSHIP_RANKS.SILVER);
      expect(calculateRankFromSpending(7999)).toBe(MEMBERSHIP_RANKS.SILVER);
      expect(calculateRankFromSpending(8000)).toBe(MEMBERSHIP_RANKS.GOLD);
      expect(calculateRankFromSpending(19999)).toBe(MEMBERSHIP_RANKS.GOLD);
      expect(calculateRankFromSpending(20000)).toBe(MEMBERSHIP_RANKS.PLATINUM);
      expect(calculateRankFromSpending(50000)).toBe(MEMBERSHIP_RANKS.PLATINUM);
    });

    it("calculates progress toward next rank accurately", () => {
      // 0 spending -> 0% to BRONZE (needs 1000)
      const prog0 = calculateProgress(0);
      expect(prog0.currentRank).toBe(MEMBERSHIP_RANKS.MEMBER);
      expect(prog0.nextRank).toBe(MEMBERSHIP_RANKS.BRONZE);
      expect(prog0.amountNeeded).toBe(1000);
      expect(prog0.progressPercentage).toBe(0);

      // 500 spending -> 50% to BRONZE (needs 500)
      const progHalf = calculateProgress(500);
      expect(progHalf.currentRank).toBe(MEMBERSHIP_RANKS.MEMBER);
      expect(progHalf.nextRank).toBe(MEMBERSHIP_RANKS.BRONZE);
      expect(progHalf.amountNeeded).toBe(500);
      expect(progHalf.progressPercentage).toBe(50);

      // 1000 spending -> BRONZE (next is SILVER, target 3000, needs 2000)
      const progBronze = calculateProgress(1000);
      expect(progBronze.currentRank).toBe(MEMBERSHIP_RANKS.BRONZE);
      expect(progBronze.nextRank).toBe(MEMBERSHIP_RANKS.SILVER);
      expect(progBronze.amountNeeded).toBe(2000);
      expect(progBronze.progressPercentage).toBe(0);

      // 2000 spending -> BRONZE (50% to SILVER)
      const progBronzeMid = calculateProgress(2000);
      expect(progBronzeMid.currentRank).toBe(MEMBERSHIP_RANKS.BRONZE);
      expect(progBronzeMid.nextRank).toBe(MEMBERSHIP_RANKS.SILVER);
      expect(progBronzeMid.amountNeeded).toBe(1000);
      expect(progBronzeMid.progressPercentage).toBe(50);

      // 3000 spending -> SILVER (next is GOLD, target 8000, needs 5000)
      const progSilver = calculateProgress(3000);
      expect(progSilver.currentRank).toBe(MEMBERSHIP_RANKS.SILVER);
      expect(progSilver.nextRank).toBe(MEMBERSHIP_RANKS.GOLD);
      expect(progSilver.amountNeeded).toBe(5000);
      expect(progSilver.progressPercentage).toBe(0);

      // 20000 spending -> PLATINUM (Max rank)
      const progPlat = calculateProgress(20000);
      expect(progPlat.currentRank).toBe(MEMBERSHIP_RANKS.PLATINUM);
      expect(progPlat.isMaxRank).toBe(true);
      expect(progPlat.amountNeeded).toBe(0);
      expect(progPlat.progressPercentage).toBe(100);
    });
  });

  describe("MembershipCard component", () => {
    it("renders member details, badge, and spending milestone", () => {
      const user = {
        username: "Somchai",
        membership: {
          rank: "SILVER",
          accumulatedSpending: 4500
        }
      };

      render(<MembershipCard user={user} />);

      expect(screen.getByText("Somchai")).toBeInTheDocument();
      expect(screen.getByText(/Member ID:/i)).toBeInTheDocument();
      expect(screen.getByText("SILVER")).toBeInTheDocument();
      expect(screen.getByText("฿4,500")).toBeInTheDocument();
      expect(screen.getByText("ช้อปอีก", { exact: false })).toBeInTheDocument();
      expect(screen.getAllByText(/GOLD/).length).toBeGreaterThanOrEqual(1);
    });

    it("toggles benefits list on button click", async () => {
      const userEventSetup = userEvent.setup();
      const user = {
        username: "Araya",
        membership: {
          rank: "GOLD",
          accumulatedSpending: 9000
        }
      };

      render(<MembershipCard user={user} />);

      const toggleBtn = screen.getByRole("button", {
        name: "ดูสิทธิประโยชน์ทั้งหมดของระดับนี้"
      });
      expect(toggleBtn).toBeInTheDocument();

      await userEventSetup.click(toggleBtn);
      expect(
        screen.getByText("ส่วนลด On-top 10% ทุกคำสั่งซื้อ")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Early Access สิทธิ์ซื้อสินค้าคอลเลกชันใหม่ก่อนใคร 24 ชม.")
      ).toBeInTheDocument();
    });
  });
});
