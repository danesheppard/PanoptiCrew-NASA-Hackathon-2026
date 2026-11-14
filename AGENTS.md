# Project Overview

This project holds all related code for the PanoptiCrew submission to NASA's 2026 Spaceapps Hackathon. There are two primary sections.

Section 1: Data Science

    The data science will involve several steps, and will largely be contained in .ipynb journals. The primary steps of this section will be:

    1. API connection for data retrieval
    2. Exploratory Data Analysis
        a. Explore data structure and consistency
    3. Case Study Analysis
        a. Temporal analysis - what time range is covered
        b. Geospatial analysis - what parts of the world are covered and how do they relate to urgent response events?
        c. Change calculation
    4. Processing for application consumption

Section 2: Application

    The application will be a single page application react application that guides the user through three views:
        a. A welcome page, explaining the team and the purpose application
        b. A global map view using Deck.gl, with several case studies displayed on the map and an information panel on the left. Clicking any case study will populate the information panel with a summary of that case study. The bottom of the information panel will have a "Launch Case Study" button that launches view "c"
        c. A three.js rendering of the case study area with lead-up, event, and takeaway tabs for further exploration.

# Coding Style

    Code suggestions should be concise, with minimal bloat. Do not suggest additional libraries or modules unless it is specifically required for the targeted fix. Prioritize using existing solutions rather than creating new functions. Variable names should be meaningful, but not too verbose.
