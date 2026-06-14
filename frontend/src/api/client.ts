/**
 * API client for AgentStore backend.
 *
 * Implements full API integration, fallback offline simulation,
 * error handling, loading states, and mock database.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

// --- Interfaces ---

export interface JSONSchema {
  type: string
  properties?: Record<string, { type: string; description?: string; enum?: string[]; items?: { type: string } }>
  required?: string[]
}

export interface Agent {
  id: string
  name: string
  description: string
  category: string
  creator: string
  version: string
  status: string
  rating: number
  downloads: number
  installs: number
  runs: number
  tags: string[]
  tools_required: string[]
  permissions_required: string[]
  inputs: JSONSchema
  outputs: JSONSchema
  example_use_case: string
  example_prompts: string[]
}

export type AgentSummary = Pick<Agent, 'id' | 'name' | 'description' | 'category' | 'rating' | 'downloads' | 'tags' | 'tools_required'>

export interface Tool {
  id: string
  name: string
  description: string
  category: string
  version: string
  permission_level: 'read' | 'write' | 'read_write'
  permissions_required: string[]
  input_schema: JSONSchema
  output_schema: JSONSchema
  mock_implementation_notes: string
}

export interface Review {
  agent_id: string
  rating: number
  review: string
  date: string
  user: string
}

export interface TraceStep {
  step: number
  action: string
  details?: string
  tool?: string
  input?: Record<string, unknown>
  output_summary?: string
}

export interface Trace {
  agent_id: string
  run_id: string
  status: 'completed' | 'failed'
  started_at: string
  completed_at: string
  user_request: string
  steps: TraceStep[]
  final_output: Record<string, unknown>
}

// --- Mock Database (In-Memory Fallback) ---

const MOCK_TOOLS: Tool[] = [
  {
    id: 'gmail_reader',
    name: 'Gmail Reader',
    description: 'Reads and summarizes email messages from a user\'s inbox.',
    category: 'Email',
    version: '1.0.0',
    permission_level: 'read',
    permissions_required: ['email.read'],
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query or label filter, e.g. "is:unread"' },
        max_results: { type: 'integer', description: 'Maximum number of threads to fetch' }
      },
      required: ['query']
    },
    output_schema: {
      type: 'object',
      properties: {
        messages: { type: 'array', items: { type: 'object' } }
      }
    },
    mock_implementation_notes: 'Retrieves raw text snippets of mock emails for semantic parsing.'
  },
  {
    id: 'calendar_reader',
    name: 'Calendar Reader',
    description: 'Reads upcoming events and scheduled meetings from calendar feeds.',
    category: 'Productivity',
    version: '1.0.0',
    permission_level: 'read',
    permissions_required: ['calendar.read'],
    input_schema: {
      type: 'object',
      properties: {
        time_min: { type: 'string', description: 'ISO start datetime' },
        time_max: { type: 'string', description: 'ISO end datetime' }
      }
    },
    output_schema: {
      type: 'object',
      properties: {
        events: { type: 'array', items: { type: 'object' } }
      }
    },
    mock_implementation_notes: 'Fetches event items from a calendar store, listing organizer and time ranges.'
  },
  {
    id: 'file_reader',
    name: 'File Reader',
    description: 'Parses text content from uploaded files (PDF, DOCX, TXT, CSV).',
    category: 'System',
    version: '1.0.0',
    permission_level: 'read',
    permissions_required: ['file.read'],
    input_schema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Absolute or relative workspace path' }
      },
      required: ['file_path']
    },
    output_schema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
        file_size: { type: 'integer' }
      }
    },
    mock_implementation_notes: 'Loads file raw bytes and returns extracted text layout summaries.'
  },
  {
    id: 'github_reader',
    name: 'GitHub Reader',
    description: 'Fetches issue reports, code pull requests, commits, and comments from repositories.',
    category: 'Developer',
    version: '1.1.0',
    permission_level: 'read',
    permissions_required: ['github.read'],
    input_schema: {
      type: 'object',
      properties: {
        repo: { type: 'string', description: 'Target repo formatted as "owner/name"' },
        state: { type: 'string', enum: ['open', 'closed', 'all'] }
      },
      required: ['repo']
    },
    output_schema: {
      type: 'object',
      properties: {
        issues: { type: 'array', items: { type: 'object' } }
      }
    },
    mock_implementation_notes: 'Returns open issue logs, titles, authors, and existing labels.'
  },
  {
    id: 'notes_tool',
    name: 'Notes Writer',
    description: 'Creates, reads, and updates structured markdown notes in the workspace.',
    category: 'Productivity',
    version: '1.0.0',
    permission_level: 'read_write',
    permissions_required: ['notes.read', 'notes.write'],
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'File name title of the note' },
        content: { type: 'string', description: 'Markdown format note content body' },
        mode: { type: 'string', enum: ['append', 'overwrite'] }
      },
      required: ['title', 'content']
    },
    output_schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        path: { type: 'string' }
      }
    },
    mock_implementation_notes: 'Writes file buffers to local data paths for developer workflows.'
  },
  {
    id: 'spreadsheet_tool',
    name: 'Spreadsheet Editor',
    description: 'Reads data rows and writes calculations back to CSV/Excel sheets.',
    category: 'Data',
    version: '1.0.0',
    permission_level: 'read_write',
    permissions_required: ['spreadsheet.read', 'spreadsheet.write'],
    input_schema: {
      type: 'object',
      properties: {
        sheet_path: { type: 'string', description: 'Spreadsheet file path' },
        formulas: { type: 'array', items: { type: 'string' }, description: 'Formulas to run on rows' }
      },
      required: ['sheet_path']
    },
    output_schema: {
      type: 'object',
      properties: {
        modified_rows: { type: 'integer' }
      }
    },
    mock_implementation_notes: 'Executes data cleaning calculations on cell grids.'
  },
  {
    id: 'web_search',
    name: 'Web Search',
    description: 'Retrieves web page summaries, news articles, and links matching organic query strings.',
    category: 'Search',
    version: '2.0.0',
    permission_level: 'read',
    permissions_required: ['search'],
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keywords' }
      },
      required: ['query']
    },
    output_schema: {
      type: 'object',
      properties: {
        results: { type: 'array', items: { type: 'object' } }
      }
    },
    mock_implementation_notes: 'Searches public web domains to compile descriptive reference articles.'
  },
  {
    id: 'browser_tool',
    name: 'Browser Automation',
    description: 'Launches a browser environment to automate forms and scrape dynamic HTML.',
    category: 'System',
    version: '1.2.0',
    permission_level: 'read_write',
    permissions_required: ['browser.launch', 'browser.interact'],
    input_schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Destination web URL address' },
        actions: { type: 'array', items: { type: 'string' }, description: 'Automation script instructions' }
      },
      required: ['url']
    },
    output_schema: {
      type: 'object',
      properties: {
        dom_snapshot: { type: 'string' },
        screenshot_url: { type: 'string' }
      }
    },
    mock_implementation_notes: 'Runs headless Chromium instances to fetch dynamic JavaScript SPA bundles.'
  }
]

const MOCK_AGENTS: Agent[] = [
  {
    id: 'email_summarizer',
    name: 'Email Summarizer Agent',
    description: 'Summarizes unread emails and highlights action items from your inbox.',
    category: 'Productivity',
    creator: 'AgentStore Team',
    version: '1.0.0',
    status: 'published',
    rating: 4.5,
    downloads: 1250,
    installs: 890,
    runs: 5420,
    tags: ['email', 'productivity', 'summarization'],
    tools_required: ['gmail_reader'],
    permissions_required: ['email.read'],
    inputs: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Email filter, e.g. "is:unread"' },
        summary_style: { type: 'string', enum: ['brief', 'detailed', 'action_items'] }
      }
    },
    outputs: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        action_items: { type: 'array', items: { type: 'string' } },
        email_count: { type: 'integer' }
      }
    },
    example_use_case: 'Get a morning briefing of unread emails with prioritized action items before starting work.',
    example_prompts: [
      'Summarize my unread emails from today',
      'What action items do I have in my inbox?'
    ]
  },
  {
    id: 'github_issue_triage',
    name: 'GitHub Issue Triage Agent',
    description: 'Analyzes open GitHub issues, suggests labels, priority, and assignees.',
    category: 'Developer Tools',
    creator: 'AgentStore Team',
    version: '1.0.0',
    status: 'published',
    rating: 4.7,
    downloads: 980,
    installs: 720,
    runs: 3100,
    tags: ['github', 'developer', 'triage', 'issues'],
    tools_required: ['github_reader'],
    permissions_required: ['github.read'],
    inputs: {
      type: 'object',
      properties: {
        repo: { type: 'string', description: 'owner/repo, e.g. "techx/agentstore"' },
        state: { type: 'string', enum: ['open', 'closed', 'all'] }
      }
    },
    outputs: {
      type: 'object',
      properties: {
        triaged_issues: {
          type: 'array',
          items: { type: 'object' }
        }
      }
    },
    example_use_case: 'Automatically triage new issues in an open-source repo every morning.',
    example_prompts: [
      'Triage all open issues in techx/agentstore',
      'Which issues need urgent attention?'
    ]
  },
  {
    id: 'calendar_planner',
    name: 'Calendar Planner Agent',
    description: 'Coordinates calendar events, resolves overlaps, and drafts agendas.',
    category: 'Productivity',
    creator: 'AgentStore Team',
    version: '1.0.2',
    status: 'published',
    rating: 4.3,
    downloads: 850,
    installs: 610,
    runs: 2400,
    tags: ['calendar', 'meeting', 'productivity'],
    tools_required: ['calendar_reader', 'notes_tool'],
    permissions_required: ['calendar.read', 'notes.write'],
    inputs: {
      type: 'object',
      properties: {
        range: { type: 'string', enum: ['day', 'week', 'month'] },
        create_agendas: { type: 'string', enum: ['yes', 'no'] }
      }
    },
    outputs: {
      type: 'object',
      properties: {
        overlap_warnings: { type: 'array', items: { type: 'string' } },
        suggested_agenda_paths: { type: 'array', items: { type: 'string' } }
      }
    },
    example_use_case: 'Optimize weekly schedule and build meeting document skeletons in advance.',
    example_prompts: [
      'Check my calendar for conflicts this week',
      'Generate weekly agendas for overlapping meetings'
    ]
  },
  {
    id: 'resume_reviewer',
    name: 'Resume Reviewer Agent',
    description: 'Provides professional resume audits against job descriptions.',
    category: 'Career',
    creator: 'AgentStore Team',
    version: '2.0.1',
    status: 'published',
    rating: 4.8,
    downloads: 1420,
    installs: 1100,
    runs: 6200,
    tags: ['resume', 'career', 'job', 'audit'],
    tools_required: ['file_reader'],
    permissions_required: ['file.read'],
    inputs: {
      type: 'object',
      properties: {
        resume_path: { type: 'string', description: 'Path to resume PDF/DOCX' },
        target_job: { type: 'string', description: 'Target job title or description' }
      }
    },
    outputs: {
      type: 'object',
      properties: {
        score: { type: 'integer' },
        keyword_gaps: { type: 'array', items: { type: 'string' } },
        formatting_issues: { type: 'array', items: { type: 'string' } }
      }
    },
    example_use_case: 'Audit a software developer CV against a staff engineer role specification.',
    example_prompts: [
      'Analyze resume.pdf against developer job posting',
      'What keywords are missing from my resume?'
    ]
  },
  {
    id: 'study_buddy',
    name: 'Study Buddy Agent',
    description: 'Generates customized flashcards, study schedules, and summaries from textbook readings.',
    category: 'Education',
    creator: 'AgentStore Team',
    version: '1.0.0',
    status: 'published',
    rating: 4.6,
    downloads: 750,
    installs: 500,
    runs: 1980,
    tags: ['education', 'study', 'flashcards', 'schedule'],
    tools_required: ['notes_tool', 'web_search'],
    permissions_required: ['notes.read', 'notes.write', 'search'],
    inputs: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'Academic subject area' },
        exam_date: { type: 'string', description: 'YYYY-MM-DD target exam' }
      }
    },
    outputs: {
      type: 'object',
      properties: {
        flashcards_created: { type: 'integer' },
        study_plan: { type: 'array', items: { type: 'string' } }
      }
    },
    example_use_case: 'Generate biochemistry flashcards and a 14-day study plan prior to midterms.',
    example_prompts: [
      'Create flashcards for cellular respiration',
      'Build a study guide for calculus'
    ]
  },
  {
    id: 'travel_deal_finder',
    name: 'Travel Deal Finder Agent',
    description: 'Scrapes travel portals for flights and hotels, compiling optimized vacation bundles.',
    category: 'Travel',
    creator: 'AgentStore Team',
    version: '1.1.0',
    status: 'published',
    rating: 3.9,
    downloads: 910,
    installs: 680,
    runs: 4100,
    tags: ['travel', 'deals', 'vacation', 'scraper'],
    tools_required: ['web_search', 'browser_tool'],
    permissions_required: ['search', 'browser.launch', 'browser.interact'],
    inputs: {
      type: 'object',
      properties: {
        origin: { type: 'string', description: 'Airport code or city' },
        destination: { type: 'string', description: 'Destination city' },
        dates: { type: 'string', description: 'Range, e.g. "July 5 - July 12"' }
      }
    },
    outputs: {
      type: 'object',
      properties: {
        recommended_flights: { type: 'array', items: { type: 'object' } },
        hotel_deals: { type: 'array', items: { type: 'object' } },
        total_estimated_cost: { type: 'integer' }
      }
    },
    example_use_case: 'Locate cheapest round-trip flights from JFK to London Heathrow for summer break.',
    example_prompts: [
      'Find deals from NYC to Paris in August',
      'Track hotel pricing for Tokyo vacation'
    ]
  },
  {
    id: 'data_cleaner',
    name: 'Data Cleaner Agent',
    description: 'Finds missing values, formats headers, and identifies outliers in spreadsheets.',
    category: 'Data Analysis',
    creator: 'AgentStore Team',
    version: '1.0.5',
    status: 'published',
    rating: 4.4,
    downloads: 1150,
    installs: 820,
    runs: 3400,
    tags: ['data', 'excel', 'cleaning', 'outliers'],
    tools_required: ['spreadsheet_tool', 'file_reader'],
    permissions_required: ['spreadsheet.read', 'spreadsheet.write', 'file.read'],
    inputs: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to CSV data' },
        handle_nulls: { type: 'string', enum: ['drop', 'fill_zero', 'interpolate'] }
      }
    },
    outputs: {
      type: 'object',
      properties: {
        rows_processed: { type: 'integer' },
        nulls_filled: { type: 'integer' },
        outliers_detected: { type: 'integer' }
      }
    },
    example_use_case: 'Clean marketing CSV grids containing malformed dates and missing email inputs.',
    example_prompts: [
      'Remove null values and clean users.csv',
      'Format column headers in sales_2026.csv'
    ]
  },
  {
    id: 'meeting_notes',
    name: 'Meeting Notes Agent',
    description: 'Summarizes transcripts, links relevant events, and documents meeting tasks.',
    category: 'Communication',
    creator: 'AgentStore Team',
    version: '1.2.0',
    status: 'published',
    rating: 4.6,
    downloads: 1380,
    installs: 990,
    runs: 5120,
    tags: ['meeting', 'transcript', 'summary', 'collaboration'],
    tools_required: ['notes_tool', 'calendar_reader'],
    permissions_required: ['notes.write', 'calendar.read'],
    inputs: {
      type: 'object',
      properties: {
        transcript_path: { type: 'string', description: 'Path to meeting txt transcript' },
        meeting_name: { type: 'string', description: 'Name of event to cross-reference' }
      }
    },
    outputs: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        decisions: { type: 'array', items: { type: 'string' } },
        tasks: { type: 'array', items: { type: 'object' } }
      }
    },
    example_use_case: 'Convert a 60-minute Zoom transcript into structured markdown action items.',
    example_prompts: [
      'Generate summary notes for design_sync.txt',
      'Extract decision list from yesterday\'s brainstorm transcript'
    ]
  },
  {
    id: 'content_generator',
    name: 'Content Generator Agent',
    description: 'Generates SEO blogs, tweets, and articles based on text references and online research.',
    category: 'Content Creation',
    creator: 'AgentStore Team',
    version: '1.0.1',
    status: 'published',
    rating: 4.2,
    downloads: 1040,
    installs: 790,
    runs: 3750,
    tags: ['seo', 'copywriting', 'blog', 'marketing'],
    tools_required: ['file_reader', 'web_search'],
    permissions_required: ['file.read', 'search'],
    inputs: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'Content subject details' },
        tone: { type: 'string', enum: ['professional', 'casual', 'humorous'] },
        word_count: { type: 'integer', description: 'Word length limit' }
      }
    },
    outputs: {
      type: 'object',
      properties: {
        draft: { type: 'string' },
        keywords_targeted: { type: 'array', items: { type: 'string' } }
      }
    },
    example_use_case: 'Draft a casual 500-word blog post on artificial intelligence using a research brief.',
    example_prompts: [
      'Write a blog post about electric vehicles',
      'Create 3 Twitter hooks on software engineering productivity'
    ]
  },
  {
    id: 'budget_analyzer',
    name: 'Budget Analyzer Agent',
    description: 'Analyzes business expense records and charts cash flow forecasts.',
    category: 'Finance',
    creator: 'AgentStore Team',
    version: '1.0.0',
    status: 'published',
    rating: 4.1,
    downloads: 690,
    installs: 450,
    runs: 1670,
    tags: ['budget', 'expenses', 'finance', 'forecasting'],
    tools_required: ['spreadsheet_tool'],
    permissions_required: ['spreadsheet.read', 'spreadsheet.write'],
    inputs: {
      type: 'object',
      properties: {
        ledger_path: { type: 'string', description: 'Path to finance ledger file' },
        period: { type: 'string', enum: ['monthly', 'quarterly', 'yearly'] }
      }
    },
    outputs: {
      type: 'object',
      properties: {
        total_expenses: { type: 'integer' },
        burn_rate: { type: 'integer' },
        recommendations: { type: 'array', items: { type: 'string' } }
      }
    },
    example_use_case: 'Compile a quarterly overhead expenses report using corporate spreadsheets.',
    example_prompts: [
      'Analyze expenses in Q2_ledger.csv',
      'Calculate company burn rate and cost savings suggestions'
    ]
  }
]

const MOCK_REVIEWS: Review[] = [
  { agent_id: 'email_summarizer', rating: 5, review: 'Saves me 30 minutes every morning. The action items feature is incredibly useful.', date: '2026-05-20', user: 'Sophia Carter' },
  { agent_id: 'email_summarizer', rating: 4, review: 'Good summaries but sometimes misses important emails in long threads.', date: '2026-05-22', user: 'James Wilson' },
  { agent_id: 'github_issue_triage', rating: 5, review: 'Perfect for our open source project. Label suggestions are spot on.', date: '2026-05-18', user: 'Liam Martinez' },
  { agent_id: 'meeting_notes', rating: 5, review: 'Best meeting notes agent I\'ve tried. Action items with owners are a game changer.', date: '2026-05-25', user: 'Olivia Davis' },
  { agent_id: 'meeting_notes', rating: 4, review: 'Works well for standups. Would love better integration with calendar events.', date: '2026-05-27', user: 'Noah Taylor' },
  { agent_id: 'resume_reviewer', rating: 5, review: 'Got actionable feedback that helped me land interviews. Highly recommend.', date: '2026-05-15', user: 'Emma Anderson' },
  { agent_id: 'travel_deal_finder', rating: 3, review: 'Found some deals but prices weren\'t always accurate. Needs improvement.', date: '2026-05-19', user: 'Ava Thomas' },
  { agent_id: 'study_buddy', rating: 4, review: 'Flashcards are great for exam prep. Study plans could be more customizable.', date: '2026-05-21', user: 'Elijah White' }
]

const MOCK_TRACES: Record<string, Trace> = {
  email_summarizer: {
    agent_id: 'email_summarizer',
    run_id: 'run_email_001',
    status: 'completed',
    started_at: '2026-05-29T09:00:00Z',
    completed_at: '2026-05-29T09:00:03Z',
    user_request: 'Summarize my unread emails from today',
    steps: [
      { step: 1, action: 'Receive user request', details: 'Parsed request: summarize unread emails, style=brief' },
      { step: 2, action: 'Identify required tools', details: 'Agent manifest requires: gmail_reader' },
      {
        step: 3,
        action: 'Call mock tool',
        tool: 'gmail_reader',
        input: { query: 'is:unread after:2026/05/29', max_results: 10 },
        output_summary: 'Retrieved 5 unread emails'
      },
      { step: 4, action: 'Process tool response', details: 'Extracted subjects, senders, and key snippets from 5 messages' },
      { step: 5, action: 'Generate final answer', details: 'Produced brief summary with 3 action items' },
      { step: 6, action: 'Save run history', details: 'Run logged to trace store with run_id run_email_001' }
    ],
    final_output: {
      summary: 'You have 5 unread emails. Key topics: project deadline (Alice), meeting reschedule (Bob), invoice approval (Finance).',
      action_items: [
        'Reply to Alice about project deadline by EOD',
        'Confirm rescheduled meeting with Bob',
        'Approve invoice #4521 in Finance portal'
      ],
      email_count: 5
    }
  },
  github_issue_triage: {
    agent_id: 'github_issue_triage',
    run_id: 'run_github_001',
    status: 'completed',
    started_at: '2026-05-29T10:15:00Z',
    completed_at: '2026-05-29T10:15:04Z',
    user_request: 'Triage all open issues in techx/agentstore',
    steps: [
      { step: 1, action: 'Receive user request', details: 'Parsed request: triage open issues for repo techx/agentstore' },
      { step: 2, action: 'Identify required tools', details: 'Agent manifest requires: github_reader' },
      {
        step: 3,
        action: 'Call mock tool',
        tool: 'github_reader',
        input: { repo: 'techx/agentstore', state: 'open' },
        output_summary: 'Retrieved 8 open issues'
      },
      { step: 4, action: 'Process tool response', details: 'Analyzed issue titles, bodies, and existing labels' },
      { step: 5, action: 'Generate final answer', details: 'Assigned suggested labels, priority, and assignees for 8 issues' },
      { step: 6, action: 'Save run history', details: 'Run logged to trace store with run_id run_github_001' }
    ],
    final_output: {
      triaged_issues: [
        { issue_number: 12, suggested_labels: ['bug', 'frontend'], priority: 'high', suggested_assignee: 'frontend-team' },
        { issue_number: 15, suggested_labels: ['enhancement', 'backend'], priority: 'medium', suggested_assignee: 'backend-team' }
      ]
    }
  },
  meeting_notes: {
    agent_id: 'meeting_notes',
    run_id: 'run_notes_001',
    status: 'completed',
    started_at: '2026-05-29T11:00:00Z',
    completed_at: '2026-05-29T11:00:05Z',
    user_request: 'Generate summary notes for design_sync.txt',
    steps: [
      { step: 1, action: 'Receive user request', details: 'Parsed request: extract summary and notes from file' },
      { step: 2, action: 'Identify required tools', details: 'Agent manifest requires: notes_tool, calendar_reader' },
      {
        step: 3,
        action: 'Call mock tool',
        tool: 'calendar_reader',
        input: { time_min: '2026-05-29T00:00:00Z', time_max: '2026-05-29T23:59:59Z' },
        output_summary: 'Identified Design Sync calendar event'
      },
      {
        step: 4,
        action: 'Call mock tool',
        tool: 'notes_tool',
        input: { title: 'design_sync.txt', content: '', mode: 'append' },
        output_summary: 'Retrieved text log buffer of transcript (14,500 characters)'
      },
      { step: 5, action: 'Analyze details', details: 'Extracted key decisions on navbar color, button click sizes, and search latency' },
      { step: 6, action: 'Format markdown notes', details: 'Structured outline: Decisions, Open questions, Action owners' },
      { step: 7, action: 'Write notes output', details: 'Created note path "/notes/design_sync_summary.md"' }
    ],
    final_output: {
      summary: 'Daily sync on design system modifications. Discussed glassmorphic tokens, responsiveness, and rating details.',
      decisions: [
        'Use Indigo gradient primary theme base (#6366f1 to #a855f7)',
        'Enable overlay background glassmorphic frames on grids'
      ],
      tasks: [
        { task: 'Implement SVG star layout rating component', owner: 'Frontend Developer' },
        { task: 'Construct simulated terminal logs with loader delays', owner: 'UX Designer' }
      ]
    }
  }
}

// In-memory runtime state for edits
const runtimeReviews = [...MOCK_REVIEWS]
const runtimeAgents = [...MOCK_AGENTS]

// --- API Client Methods ---

export async function fetchAgents(): Promise<AgentSummary[]> {
  try {
    const res = await fetch(`${API_BASE}/agents`)
    if (!res.ok) throw new Error('API server returned error status')
    const data = await res.json()
    // Map full agent objects to summary
    return data.map((a: Agent) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      category: a.category,
      rating: a.rating,
      downloads: a.downloads,
      tags: a.tags || [],
      tools_required: a.tools_required || []
    }))
  } catch (error) {
    console.warn('Backend server unreachable. Falling back to local offline Agent DB.', error)
    // Return summaries from local db
    return runtimeAgents.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      category: a.category,
      rating: a.rating,
      downloads: a.downloads,
      tags: a.tags,
      tools_required: a.tools_required
    }))
  }
}

export async function fetchAgent(id: string): Promise<Agent> {
  try {
    const res = await fetch(`${API_BASE}/agents/${id}`)
    if (!res.ok) throw new Error(`Agent not found: ${id}`)
    return await res.json()
  } catch (error) {
    console.warn(`Backend fetch failed for agent ${id}. Using offline fallback.`, error)
    const localAgent = runtimeAgents.find((a) => a.id === id)
    if (!localAgent) {
      throw new Error(`Agent not found in offline DB: ${id}`)
    }
    return localAgent
  }
}

export async function fetchTools(): Promise<Tool[]> {
  try {
    const res = await fetch(`${API_BASE}/tools`)
    if (!res.ok) throw new Error('Failed to fetch tools list')
    return await res.json()
  } catch (error) {
    console.warn('Backend fetch failed for tools. Using offline fallback.', error)
    return MOCK_TOOLS
  }
}

export async function runAgent(id: string, input: Record<string, unknown> = {}): Promise<Trace> {
  try {
    const res = await fetch(`${API_BASE}/agents/${id}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    })
    if (!res.ok) throw new Error(`Run failed for agent: ${id}`)
    return await res.json()
  } catch (error) {
    console.warn(`Backend run failed for agent ${id}. Simulating trace locally.`, error)
    // Artificial 500ms delay to feel premium before returning simulated trace
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    // Check if we have pre-configured trace
    const prebuilt = MOCK_TRACES[id]
    if (prebuilt) {
      return prebuilt
    }

    // Procedural trace generation for agents without explicit traces
    const agent = runtimeAgents.find((a) => a.id === id)
    const agentName = agent ? agent.name : 'Unknown Agent'
    const tools = agent ? agent.tools_required : []
    
    const steps: TraceStep[] = [
      { step: 1, action: 'Receive execution request', details: `Parsed input: ${JSON.stringify(input)}` }
    ]

    let stepCounter = 2
    tools.forEach((toolId) => {
      steps.push({
        step: stepCounter++,
        action: `Invoke system tool: ${toolId}`,
        tool: toolId,
        input: { input },
        output_summary: `Tool execution simulated successfully.`
      })
    })

    steps.push({ step: stepCounter++, action: 'Synthesize data models', details: `Compiling LLM summaries for ${agentName}` })
    steps.push({ step: stepCounter, action: 'Return final result', details: 'Simulated execution completed.' })

    return {
      agent_id: id,
      run_id: `run_sim_${Math.random().toString(36).substr(2, 9)}`,
      status: 'completed',
      started_at: new Date(Date.now() - 3000).toISOString(),
      completed_at: new Date().toISOString(),
      user_request: Object.values(input)[0] as string || `Trigger execution of ${agentName}`,
      steps,
      final_output: {
        status: 'success',
        message: `Simulated run completed successfully for ${agentName}!`,
        tools_triggered: tools,
        timestamp: new Date().toISOString()
      }
    }
  }
}

export async function fetchReviews(agentId: string): Promise<Review[]> {
  try {
    const res = await fetch(`${API_BASE}/agents/${agentId}/reviews`)
    if (!res.ok) throw new Error('Failed to fetch reviews')
    return await res.json()
  } catch {
    return runtimeReviews.filter((r) => r.agent_id === agentId)
  }
}

export async function addReview(agentId: string, reviewData: { rating: number; review: string; user: string }): Promise<Review> {
  const newReview: Review = {
    agent_id: agentId,
    rating: reviewData.rating,
    review: reviewData.review,
    user: reviewData.user || 'Anonymous User',
    date: new Date().toISOString().split('T')[0]
  }

  try {
    const res = await fetch(`${API_BASE}/agents/${agentId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReview)
    })
    if (!res.ok) throw new Error('API review submit failed')
    return await res.json()
  } catch (error) {
    console.warn('Backend review submit failed or unavailable. Appending to offline database.', error)
    // Add review locally in-memory
    runtimeReviews.unshift(newReview)

    // Update agent score in memory
    const agent = runtimeAgents.find((a) => a.id === agentId)
    if (agent) {
      const allRatings = runtimeReviews.filter((r) => r.agent_id === agentId).map((r) => r.rating)
      const avg = allRatings.reduce((sum, val) => sum + val, 0) / allRatings.length
      agent.rating = avg
    }
    
    return newReview
  }
}

export async function forkAgent(id: string, newName: string): Promise<Agent> {
  try {
    const res = await fetch(`${API_BASE}/agents/${id}/fork`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    })
    if (!res.ok) throw new Error('Fork failed')
    return await res.json()
  } catch (error) {
    console.warn(`Backend fork failed. Simulating locally.`, error)
    const baseAgent = runtimeAgents.find((a) => a.id === id)
    if (!baseAgent) throw new Error(`Base agent ${id} not found to remix.`)
    
    const forked: Agent = {
      ...baseAgent,
      id: `${id}_fork_${Math.floor(Math.random() * 1000)}`,
      name: newName,
      creator: 'You (Remix)',
      downloads: 0,
      installs: 1,
      runs: 0,
      rating: 5.0
    }

    runtimeAgents.unshift(forked)
    return forked
  }
}
