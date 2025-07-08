import { IntegrationNode } from '@/types/integrations';
import { GitBranch, Square, Users, CheckSquare } from 'lucide-react';

export const githubIntegration: IntegrationNode = {
  id: 'github',
  name: 'GitHub',
  description: 'Manage GitHub repositories and issues',
  category: 'developer_tools',
  icon: GitBranch,
  color: '#181717',
  requiresAuth: true,
  authType: 'bearer',
  type: 'action',
  configSchema: {
    access_token: {
      type: 'password',
      label: 'Access Token',
      required: true
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'GitHub Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Create Issue', value: 'create_issue' },
        { label: 'Update Issue', value: 'update_issue' },
        { label: 'List Issues', value: 'list_issues' },
        { label: 'Create Pull Request', value: 'create_pr' },
        { label: 'List Repositories', value: 'list_repos' },
        { label: 'Create Repository', value: 'create_repo' }
      ]
    },
    {
      name: 'owner',
      label: 'Repository Owner',
      type: 'text',
      required: true,
      placeholder: 'octocat'
    },
    {
      name: 'repo',
      label: 'Repository Name',
      type: 'text',
      required: true,
      placeholder: 'Hello-World'
    },
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: false,
      placeholder: 'Issue or PR title'
    },
    {
      name: 'body',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Detailed description'
    },
    {
      name: 'labels',
      label: 'Labels',
      type: 'text',
      required: false,
      placeholder: 'bug,enhancement',
      helpText: 'Comma-separated labels'
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute GitHub Operation',
      description: 'Execute GitHub API operation',
      method: 'POST',
      path: '/github/execute',
      parameters: {
        operation: {
          type: 'text',
          label: 'Operation',
          required: true
        },
        owner: {
          type: 'text',
          label: 'Owner',
          required: true
        },
        repo: {
          type: 'text',
          label: 'Repository',
          required: true
        }
      }
    }
  ]
};

export const jiraIntegration: IntegrationNode = {
  id: 'jira',
  name: 'Jira',
  description: 'Manage Jira issues and projects',
  category: 'developer_tools',
  icon: Square,
  color: '#0052CC',
  requiresAuth: true,
  authType: 'basic',
  type: 'action',
  configSchema: {
    domain: {
      type: 'text',
      label: 'Jira Domain',
      required: true
    },
    email: {
      type: 'text',
      label: 'Email',
      required: true
    },
    api_token: {
      type: 'password',
      label: 'API Token',
      required: true
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'Jira Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Create Issue', value: 'create_issue' },
        { label: 'Update Issue', value: 'update_issue' },
        { label: 'Search Issues', value: 'search_issues' },
        { label: 'Add Comment', value: 'add_comment' },
        { label: 'Transition Issue', value: 'transition' },
        { label: 'List Projects', value: 'list_projects' }
      ]
    },
    {
      name: 'project_key',
      label: 'Project Key',
      type: 'text',
      required: true,
      placeholder: 'PROJ'
    },
    {
      name: 'issue_type',
      label: 'Issue Type',
      type: 'select',
      required: false,
      options: [
        { label: 'Bug', value: 'Bug' },
        { label: 'Task', value: 'Task' },
        { label: 'Story', value: 'Story' },
        { label: 'Epic', value: 'Epic' }
      ]
    },
    {
      name: 'summary',
      label: 'Summary',
      type: 'text',
      required: false,
      placeholder: 'Issue summary'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Detailed description'
    },
    {
      name: 'assignee',
      label: 'Assignee',
      type: 'text',
      required: false,
      placeholder: 'user@example.com'
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute Jira Operation',
      description: 'Execute Jira operation',
      method: 'POST',
      path: '/jira/execute',
      parameters: {
        operation: {
          type: 'text',
          label: 'Operation',
          required: true
        },
        project_key: {
          type: 'text',
          label: 'Project Key',
          required: true
        }
      }
    }
  ]
};

export const trelloIntegration: IntegrationNode = {
  id: 'trello',
  name: 'Trello',
  description: 'Manage Trello boards and cards',
  category: 'developer_tools',
  icon: Users,
  color: '#0079BF',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  configSchema: {
    api_key: {
      type: 'text',
      label: 'API Key',
      required: true
    },
    token: {
      type: 'password',
      label: 'Token',
      required: true
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'Trello Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Create Card', value: 'create_card' },
        { label: 'Update Card', value: 'update_card' },
        { label: 'Move Card', value: 'move_card' },
        { label: 'List Cards', value: 'list_cards' },
        { label: 'Create List', value: 'create_list' },
        { label: 'List Boards', value: 'list_boards' }
      ]
    },
    {
      name: 'board_id',
      label: 'Board ID',
      type: 'text',
      required: true,
      placeholder: '5e8b8f8f8f8f8f8f8f8f8f8f'
    },
    {
      name: 'list_id',
      label: 'List ID',
      type: 'text',
      required: false,
      placeholder: '5e8b8f8f8f8f8f8f8f8f8f8f'
    },
    {
      name: 'card_name',
      label: 'Card Name',
      type: 'text',
      required: false,
      placeholder: 'New task'
    },
    {
      name: 'card_description',
      label: 'Card Description',
      type: 'textarea',
      required: false,
      placeholder: 'Task details'
    },
    {
      name: 'due_date',
      label: 'Due Date',
      type: 'text',
      required: false,
      placeholder: '2024-12-31'
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute Trello Operation',
      description: 'Execute Trello operation',
      method: 'POST',
      path: '/trello/execute',
      parameters: {
        operation: {
          type: 'text',
          label: 'Operation',
          required: true
        },
        board_id: {
          type: 'text',
          label: 'Board ID',
          required: true
        }
      }
    }
  ]
};

export const asanaIntegration: IntegrationNode = {
  id: 'asana',
  name: 'Asana',
  description: 'Manage Asana tasks and projects',
  category: 'developer_tools',
  icon: CheckSquare,
  color: '#F06A6A',
  requiresAuth: true,
  authType: 'bearer',
  type: 'action',
  configSchema: {
    access_token: {
      type: 'password',
      label: 'Access Token',
      required: true
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'Asana Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Create Task', value: 'create_task' },
        { label: 'Update Task', value: 'update_task' },
        { label: 'Complete Task', value: 'complete_task' },
        { label: 'List Tasks', value: 'list_tasks' },
        { label: 'Create Project', value: 'create_project' },
        { label: 'List Projects', value: 'list_projects' }
      ]
    },
    {
      name: 'project_id',
      label: 'Project ID',
      type: 'text',
      required: false,
      placeholder: '1234567890123456'
    },
    {
      name: 'task_name',
      label: 'Task Name',
      type: 'text',
      required: false,
      placeholder: 'Complete project documentation'
    },
    {
      name: 'task_notes',
      label: 'Task Notes',
      type: 'textarea',
      required: false,
      placeholder: 'Additional task details'
    },
    {
      name: 'assignee',
      label: 'Assignee Email',
      type: 'text',
      required: false,
      placeholder: 'user@example.com'
    },
    {
      name: 'due_on',
      label: 'Due Date',
      type: 'text',
      required: false,
      placeholder: '2024-12-31'
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute Asana Operation',
      description: 'Execute Asana operation',
      method: 'POST',
      path: '/asana/execute',
      parameters: {
        operation: {
          type: 'text',
          label: 'Operation',
          required: true
        },
        project_id: {
          type: 'text',
          label: 'Project ID',
          required: false
        }
      }
    }
  ]
};