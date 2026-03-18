import express from "express";
import axios from "axios";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let liveData = { matches: [], odds: {} };

/* ----------------------------------------------------
   ✅ ROUTES
---------------------------------------------------- */

// 🏏 Fetch matches by sport ID (4 = cricket)
app.get("/api/matches/:sportId", (req, res) => {
  const { sportId } = req.params;
  if (sportId === "4") {
    const formattedMatches = liveData.matches.map((match) => ({
      id: match.eventId,
      matchId: match.eventId,
      name: match.matchName,
      event_date: match.matchDate || new Date().toISOString(),
      league: { name: match.seriesName || "Cricket League" },
      status: "live",
      marketId: match.marketId,
      scoreIframe: match.scoreIframe,
    }));
    return res.json({ success: true, data: formattedMatches });
  }
  return res.json({ success: true, data: [] });
});

// 🎯 Fetch specific match by eventId
app.get("/api/match/:eventId", (req, res) => {
  const { eventId } = req.params;
  const match = liveData.matches.find((m) => m.eventId === eventId);
  if (!match)
    return res.status(404).json({ success: false, message: "Match not found" });

  const matchOdds = liveData.odds[match.marketId] || {};
  const matchData = {
    match: {
      id: match.eventId,
      name: match.matchName,
      marketId: match.marketId,
      scoreIframe: match.scoreIframe,
      status: "OPEN",
      runners: matchOdds.matchOdds || [],
      minStake: 100,
      maxStake: 10000,
      betDelay: 0,
    },
    markets: [],
    fancyMarkets: matchOdds.fancyMarkets || [],
    bookmakers: [],
    upcoming: [],
  };
  return res.json(matchData);
});

// ⚡ Direct odds API
app.get("/api/odds", (req, res) => {
  const { market_id } = req.query;
  if (!market_id)
    return res.status(400).json({ error: "Market ID is required" });

  if (!liveData.odds[market_id]) {
    fetchOdds().then(() => {
      if (liveData.odds[market_id]) res.json(liveData.odds[market_id]);
      else
        res.json({
          matchName: `Market ${market_id}`,
          matchOdds: [],
          fancyMarkets: [],
          commissionFancy: [],
          noCommissionFancy: [],
        });
    });
  } else {
    res.json(liveData.odds[market_id]);
  }
});

/* ----------------------------------------------------
   🏏 FETCH ONGOING MATCHES (In-Play)
---------------------------------------------------- */
const fetchOngoingMatches = async () => {
  try {
    console.log("📡 Fetching in-play matches...");

    const response = await axios.post(
      "https://api.ons3.co/v1/sports/matchList",
      {},
      {
        headers: {
          Accept: "application/json",
          Origin: "https://1ex99.in",
          Referer: "https://1ex99.in/",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        },
      }
    );

    const matches = response.data?.data || [];
    console.log(`🧾 Found ${matches.length} in-play matches`);

    if (!matches.length) return;

    const processedMatches = await Promise.all(
      matches.map(async (match) => {
        let scoreIframe = null;
        try {
          const zplayResponse = await axios.get(
            `https://zplay1.in/pb/api/v1/events/matchDetails/${match.eventId}`,
            {
              headers: {
                Accept: "application/json",
                Origin: "https://zplay1.in",
                Referer: "https://zplay1.in/",
              },
            }
          );

          const radarId = zplayResponse.data?.data?.match?.sportsradar_id;
          if (radarId && radarId !== 0) {
            scoreIframe = `https://scorecard.oddstrad.com/get-scorecard-iframe/4/${match.eventId}/${radarId}`;
          } else {
            console.warn(`⚠️ sportsradar_id missing for ${match.eventId}`);
          }
        } catch (err) {
          console.warn(`⚠️ Failed zplay fetch for ${match.eventId}:`, err.message);
        }

        return {
          eventId: match.eventId,
          matchName: match.matchName,
          marketId: match.marketId,
          matchDate: match.matchDate,
          seriesName: match.seriesName || "Cricket Series",
          scoreIframe,
        };
      })
    );

    liveData.matches = processedMatches;
    io.emit("updateMatches", liveData.matches);
    console.log(`✅ Stored ${liveData.matches.length} matches in memory`);
  } catch (err) {
    console.error("❌ Error fetching ongoing matches:", err.message);
  }
};

/* ----------------------------------------------------
   🎯 FETCH ODDS FOR EACH MARKET
---------------------------------------------------- */
const fetchOdds = async () => {
  try {
    const marketIds = liveData.matches.map((m) => m.marketId).filter(Boolean);
    if (marketIds.length === 0) {
      console.log("⚠️ No market IDs to fetch odds");
      return;
    }

    for (const marketId of marketIds) {
      try {
        const url = `https://socket.1ex99.in/v2/api/oddsDataNew?market_id=${marketId}`;
        const response = await axios.get(url, {
          headers: {
            accept: "application/json, text/plain, */*",
            origin: "https://1ex99.in",
            referer: "https://1ex99.in/",
          },
        });

        if (response.data && response.data.result) {
          const matchData = liveData.matches.find(
            (match) => match.marketId === marketId
          );
          const matchName = matchData
            ? matchData.matchName
            : `Market ${marketId}`;

          liveData.odds[marketId] = {
            matchName,
            matchOdds: response.data.result.team_data || [],
            fancyMarkets: response.data.result.session || [],
            commissionFancy: response.data.result.commission_fancy_data || [],
            noCommissionFancy: response.data.result.no_commission_fancy_data || [],
          };
        } else {
          console.log(`⚠️ No odds result for market ${marketId}`);
        }
      } catch (err) {
        console.error(`❌ Error fetching odds for ${marketId}:`, err.message);
      }
    }

    io.emit("updateOdds", liveData.odds);
    console.log("✅ Odds updated for markets:", Object.keys(liveData.odds).length);
  } catch (err) {
    console.error("❌ Error in fetchOdds:", err.message);
  }
};

/* ----------------------------------------------------
   ⏱️ Periodic Polling
---------------------------------------------------- */
fetchOngoingMatches(); // initial call
setInterval(fetchOngoingMatches, 10_000); // every 10 seconds
setInterval(fetchOdds, 15_000); // every 15 seconds

/* ----------------------------------------------------
   🚀 Start Server
---------------------------------------------------- */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);

// Socket.IO
io.on("connection", (socket) => {
  console.log("⚡ Socket connected:", socket.id);
  socket.emit("hello", { msg: "connected" });
  socket.on("disconnect", () =>
    console.log("Socket disconnected:", socket.id)
  );
});