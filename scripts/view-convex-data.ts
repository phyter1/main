#!/usr/bin/env bun
/**
 * View Convex Database Contents
 * Quick script to inspect what's stored in Convex
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL is not set");
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

async function viewData() {
  console.log("🔍 Convex Database Contents\n");
  console.log("=" . repeat(60));

  try {
    // View chat prompt versions
    console.log("\n📝 Chat Agent Prompt Versions:");
    console.log("-".repeat(60));
    const chatVersions = await client.query(api.prompts.listVersions, {
      agentType: "chat",
    });

    if (chatVersions.length === 0) {
      console.log("  (No versions found)");
    } else {
      for (const version of chatVersions) {
        console.log(`  ID: ${version._id}`);
        console.log(`  Description: ${version.description}`);
        console.log(`  Author: ${version.author}`);
        console.log(`  Token Count: ${version.tokenCount}`);
        console.log(`  Active: ${version.isActive ? "✓" : "✗"}`);
        console.log(`  Created: ${new Date(version._creationTime).toLocaleString()}`);
        console.log(`  Prompt Preview: ${version.prompt.substring(0, 100)}...`);
        console.log("-".repeat(60));
      }
    }

    // View fit-assessment prompt versions
    console.log("\n🎯 Fit Assessment Agent Prompt Versions:");
    console.log("-".repeat(60));
    const fitVersions = await client.query(api.prompts.listVersions, {
      agentType: "fit-assessment",
    });

    if (fitVersions.length === 0) {
      console.log("  (No versions found)");
    } else {
      for (const version of fitVersions) {
        console.log(`  ID: ${version._id}`);
        console.log(`  Description: ${version.description}`);
        console.log(`  Author: ${version.author}`);
        console.log(`  Token Count: ${version.tokenCount}`);
        console.log(`  Active: ${version.isActive ? "✓" : "✗"}`);
        console.log(`  Created: ${new Date(version._creationTime).toLocaleString()}`);
        console.log(`  Prompt Preview: ${version.prompt.substring(0, 100)}...`);
        console.log("-".repeat(60));
      }
    }

    // View test cases
    console.log("\n🧪 Test Cases:");
    console.log("-".repeat(60));
    const chatTests = await client.query(api.testCases.listTestCases, {
      agentType: "chat",
    });
    const fitTests = await client.query(api.testCases.listTestCases, {
      agentType: "fit-assessment",
    });

    const allTests = [...chatTests, ...fitTests];
    if (allTests.length === 0) {
      console.log("  (No test cases found)");
    } else {
      for (const test of allTests) {
        console.log(`  ID: ${test._id}`);
        console.log(`  Agent Type: ${test.agentType}`);
        console.log(`  Question: ${test.question}`);
        console.log(`  Criteria: ${test.criteria.length} criteria`);
        console.log("-".repeat(60));
      }
    }

    console.log("\n✅ Database query complete!");
    console.log("\n💡 Tip: View full data at https://dashboard.convex.dev/d/secret-lemming-168");
  } catch (error) {
    console.error("❌ Error querying database:", error);
    process.exit(1);
  }
}

viewData();
