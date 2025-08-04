# HALO Nodes

This directory contains all node definitions for the HALO automation platform. Each node is self-contained in its own folder with TypeScript definitions and SVG icons.

## Adding a New Node

1. **Create a new folder** in `src/nodes/` with your node name (e.g., `MyCustomNode`)

2. **Add the node definition file** `MyCustomNode.node.ts`:
   ```typescript
   import { HaloNodeDefinition } from '../../types/haloNode';
   import icon from './mycustomnode.svg';
   import darkIcon from './mycustomnode.dark.svg';

   export const MyCustomNodeNode: HaloNodeDefinition = {
     displayName: 'My Custom Node',
     name: 'myCustomNode',
     icon,
     darkIcon,
     group: ['transform'], // or 'trigger', 'output', etc.
     version: 1,
     description: 'Description of what this node does',
     defaults: {
       name: 'My Custom Node',
       color: '#3B82F6',
     },
     inputs: ['main'],
     outputs: ['main'],
     properties: [
       // Define your node's configuration properties here
     ],
     async execute(context) {
       // Implement your node's logic here
       return [[]];
     },
   };
   ```

3. **Add SVG icons**:
   - `mycustomnode.svg` - Light theme icon
   - `mycustomnode.dark.svg` - Dark theme icon (optional)

4. **Define properties** for your node's configuration:
   ```typescript
   properties: [
     {
       displayName: 'Setting Name',
       name: 'settingName',
       type: 'string', // or 'number', 'boolean', 'options', 'json'
       default: '',
       required: true,
       description: 'What this setting does',
     },
   ]
   ```

5. **Implement the execute method**:
   ```typescript
   async execute(context: HaloNodeExecuteContext): Promise<HaloNodeExecutionData[][]> {
     const items = context.getInputData();
     const returnData: HaloNodeExecutionData[] = [];

     for (let i = 0; i < items.length; i++) {
       const setting = context.getNodeParameter('settingName', i);
       
       // Your node logic here
       
       returnData.push({
         json: {
           // Your output data
         },
       });
     }

     return [returnData];
   }
   ```

## Node Structure

```
src/nodes/
├── NodeName/
│   ├── NodeName.node.ts    # Node definition
│   ├── nodename.svg        # Light theme icon
│   └── nodename.dark.svg   # Dark theme icon (optional)
└── README.md
```

## Node Types

- **Trigger nodes**: Start workflows (webhooks, schedules, etc.)
- **Action nodes**: Perform operations (HTTP requests, database operations, etc.)
- **Transform nodes**: Modify data (filters, mappers, etc.)
- **Logic nodes**: Control flow (conditions, loops, etc.)

## Property Types

- `string`: Text input
- `number`: Numeric input
- `boolean`: Checkbox
- `options`: Dropdown with predefined choices
- `json`: JSON editor
- `collection`: Nested properties

## Best Practices

1. Keep node names in camelCase (e.g., `httpRequest`, `sendEmail`)
2. Use descriptive displayNames (e.g., "HTTP Request", "Send Email")
3. Provide clear descriptions for all properties
4. Handle errors gracefully in the execute method
5. Use consistent color schemes for related nodes
6. Test your nodes thoroughly before deployment

## Icon Guidelines

- Use 24x24px SVG icons
- Keep designs simple and recognizable
- Use consistent stroke width (2px recommended)
- Provide both light and dark theme variants
- Use the service's brand colors when applicable