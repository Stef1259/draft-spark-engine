# Editorial Assistant MVP



## Problem Framing & Assumptions

**Problem**: Editors need to efficiently transform interview transcripts into polished articles while maintaining source integrity and editorial control.

**Key Assumptions**:
- Editors want human-in-the-loop control over AI-generated content
- Source attribution and quote verification are critical for editorial integrity
- Workflow should be intuitive for non-technical users
- It is aasumed that the language used for writing articles, and source content would be English

## Architecture

<img width="727" height="525" alt="image" src="https://github.com/user-attachments/assets/53509d08-df3c-4820-a029-31da06dd2442" />


### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Transcript     │    │  Source         │    │  Key Points     │
│  Input          │───▶│  Manager        │───▶│  Editor         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Export         │◀───│  Draft Editor   │◀───│  Story Direction│
│  Controls       │    │  + Quote Check  │    │  Controls       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **Input**: Transcript + Supporting Sources (PDF/URL)
2. **Processing**: AI extraction of key points (simulated)
3. **Review**: Human approval/editing of key points
4. **Direction**: Set story tone, length, and focus
5. **Generation**: AI draft creation (simulated)
6. **Verification**: Quote checking and source mapping
7. **Export**: Markdown + provenance JSON

## Key Features

### ✅ Core Flow Implementation

- **Transcript Input**: Drag & drop or paste text files
- **Source Management**: URL scraping and PDF upload simulation
- **Key Points Extraction**: AI-powered extraction with human review
- **Story Direction**: Tone, length, and custom angle controls
- **Draft Generation**: AI-powered article creation
- **Quote Verification**: Automatic quote checking against sources
- **Source Mapping**: Hover-to-see source attribution per paragraph
- **Export**: Markdown + comprehensive provenance JSON

### ✅ Quote Integrity & Source Mapping

- **Quote Detection**: Regex-based extraction of quoted text
- **Source Matching**: Normalized text comparison with context
- **Visual Feedback**: Clear indicators for verified vs. unverified quotes
- **Source Attribution**: Hover cards showing paragraph-to-source mapping

### ✅ UX Clarity & HITL Controls

- **Progressive Disclosure**: Step-by-step workflow with clear visual hierarchy
- **Human Override**: Edit key points, adjust story direction, modify draft
- **Visual Feedback**: Loading states, progress indicators, and status badges
- **Demo Mode**: One-click demo data loading for immediate testing

### ✅ Product Thinking & Creativity

- **Direction Presets**: Quick-start templates (Founder Story, Technical Deep-Dive, etc.)
- **Smart Defaults**: Sensible tone/length combinations
- **Source Intelligence**: Automatic paragraph-to-source mapping
- **Export Flexibility**: Both human-readable and machine-processable formats

## Technical Implementation

### Quote Checking Algorithm

```typescript
// Normalize text for comparison
const normalizeText = (text: string) => 
  text.toLowerCase()
    .replace(/[.,;:!?""'']/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// Find quotes in draft
const quotes = findQuotesInText(draftText);

// Check each quote against sources
for (const quote of quotes) {
  const match = findQuoteInSource(quote, sourceText);
  // Return context and verification status
}
```

### Source Mapping

- **Keyword Matching**: Simple heuristic based on shared vocabulary
- **Hover Cards**: Interactive source attribution per paragraph
- **Provenance Tracking**: Complete audit trail in export JSON

## Trade-offs & Design Decisions

### What We Optimized For

1. **Editorial Control**: Human review at every step
2. **Source Integrity**: Comprehensive quote verification
3. **User Experience**: Intuitive workflow with clear feedback
4. **Demonstration**: Realistic mock data and smooth interactions

### What We Simplified

1. **AI Integration**: Simulated outputs instead of real LLM calls
2. **File Processing**: Mock PDF extraction and URL scraping
3. **Advanced NLP**: Basic keyword matching vs. semantic analysis
4. **Real-time Collaboration**: Single-user workflow
5.  **User onboarding process**: Attractive landing page was removed due to time constrains
   

### What We'd Do Next (Another Day)
2. **Advanced Source Processing**: PDF text extraction, web scraping
3. **Semantic Source Mapping**: NLP-based paragraph-to-source matching
4. **Version Control**: Draft versioning and checkpoint system
5. **Collaborative Features**: Multi-editor workflow
6. **Performance**: Large transcript handling (10k+ chars)
7. **Export Formats**: HTML, Word, and custom templates
8. **Authorisation** : For users with admin previlages to approve articles
9. **Grammer and spell chek inbuilt**
10. **Fact checking using real time internet Data for reliable writing**

## Sample Data & Demonstartion video

Sample data used for the demo and the demonstration video can be found via the following link :https://drive.google.com/drive/folders/1BEn1Qk22iqsKnEo4qqsQ_dKLzZND7Wni?usp=sharing



## Getting Started for running locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```



## Usage

1. **Load Demo Data**: Click "Load Demo Data" for instant setup
2. **Extract Key Points**: Review and edit AI-generated key points
3. **Set Direction**: Choose preset or customize story direction
4. **Generate Draft**: Create article from approved key points
5. **Check Quotes**: Verify all quotes against sources
6. **Export**: Download Markdown + provenance JSON
7. **PLEASE MAKE SURE TO USE A WORKING/VALID EMAIL ADDRESS AT REGISTRATION AS THE CONFIRMATION CODE WILL BE SENT TO THE EMAIL**

## Technical Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **State**: React hooks + local state
- **Export**: Client-side file generation
- **Auth**: Supabase (demo purposes)
- **AI**: Free Gemini APIs were used for generating the article content and the article
- **Tools used** : Lovable (initial protype generation), Cursor (Addtional feature implementation), ChatGPT (For generating implementation plan & prompts), Vercel (Deployment)
