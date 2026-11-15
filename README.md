# Panoptic Explorer, by the PanoptiCrew

The Panoptic Explorer is a NASA Space Apps Challenge 2026 project exploring how satellite observations can help reveal environmental change and provide useful geospatial context for urgent response. The project combines data-science analysis with an interactive application that makes selected case studies easier to explore.

## Project Purpose

Satellite imagery can capture changes across large areas, but turning those observations into useful evidence requires understanding when and where change occurred, what the signal can support, and where uncertainty remains. PanoptiCrew studies environmental events through temporal and geospatial analysis, then presents selected findings with their methods, limitations, and sources.

The application is an educational exploration tool, not a live monitoring service or a source of operational response recommendations.

## Project Workstreams

### Data Science

The data-science work is organized around retrieving Earth-observation data, inspecting its structure and coverage, analyzing case studies, calculating change, and preparing results for the application. Jupyter notebooks document the analyses; case-specific exports include imagery, geospatial features, charts, and metadata.

### Application

The React single-page application guides visitors through three views:

1. A welcome page introduces the project and team.
2. A global Deck.gl map presents case-study locations, selectable satellite layers, and a study summary.
3. A Three.js terrain view presents each selected case study through overview, lead-up, event, and takeaway chapters.

The application uses static case-study content and exported assets. See the [application guide](application/README.md) for setup, configuration, and data conventions.

## Repository Layout

- [`dataScience/`](dataScience/) contains analysis notebooks, data exports, and data-science setup notes.
- [`application/`](application/) contains the React application and its developer guide.

## Getting Started

Each workstream has its own instructions:

- [Run and configure the application](application/README.md)
- [Data-science project notes](dataScience/README.md)

## Artificial Intelligence Usage Acknowledgement

- **Tool Used:** GitHub Copilot with GPT-6 Luna and Claude Sonnet 5.5
- **Affected Files:** `README.md`, `application/README.md`, `application/src/utilities/buildLegend.jsx`, `application/src/views/GlobalMap.jsx`, `application/src/views/CaseStudy.jsx`, `application/src/styles.css`, and `application/src/data/caseStudies.ts`, and the data science notebooks.
- **Purpose:** Assisted with project and application rapid prototyping, debugging, syntax checking, and documentation. In the data science notebooks, AI was used to search for and cross-check event sources, and to draft and debug the code, which the team then ran, checked against the sources and edited?.
- **Human Oversight:** All AI output was reviewed for consistency, validity, embedded assumptions, and agreement with team-directed project design goals. Scientific interpretations, application architecture planning, and data structure design were all conducted without the use of AI.
