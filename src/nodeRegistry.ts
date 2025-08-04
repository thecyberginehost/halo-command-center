import { HaloNodeDefinition, NodeRegistryEntry } from './types/haloNode';

// Eager import all node definitions
const nodeFiles = import.meta.glob('./nodes/*/*.node.ts', { eager: true });

// Eager import all SVG files
const iconFiles = import.meta.glob('./nodes/*/*.svg', { eager: true, as: 'url' });

// Build the node registry
export const nodeRegistry: NodeRegistryEntry[] = [];

// Process each node file
Object.entries(nodeFiles).forEach(([path, module]) => {
  const nodeModule = module as any;
  
  // Find the exported node definition (should end with 'Node')
  const nodeExport = Object.values(nodeModule).find(
    (value: any) => value && typeof value === 'object' && value.displayName && value.execute
  ) as HaloNodeDefinition;

  if (!nodeExport) {
    console.warn(`No valid node definition found in ${path}`);
    return;
  }

  // Extract folder name from path (e.g., './nodes/HttpRequest/HttpRequest.node.ts' -> 'HttpRequest')
  const folderMatch = path.match(/\.\/nodes\/([^\/]+)\//);
  if (!folderMatch) {
    console.warn(`Could not extract folder name from ${path}`);
    return;
  }
  
  const folderName = folderMatch[1];
  
  // Find corresponding icon files
  const lightIconPath = `./nodes/${folderName}/${folderName.toLowerCase()}.svg`;
  const darkIconPath = `./nodes/${folderName}/${folderName.toLowerCase()}.dark.svg`;
  
  const iconUrl = iconFiles[lightIconPath] as string;
  const darkIconUrl = iconFiles[darkIconPath] as string;

  if (!iconUrl) {
    console.warn(`No icon found for node ${nodeExport.name} at ${lightIconPath}`);
  }

  // Create registry entry
  const registryEntry: NodeRegistryEntry = {
    ...nodeExport,
    iconUrl: iconUrl || '',
    darkIconUrl: darkIconUrl,
  };

  nodeRegistry.push(registryEntry);
});

// Sort nodes by display name
nodeRegistry.sort((a, b) => a.displayName.localeCompare(b.displayName));

console.log(`Loaded ${nodeRegistry.length} nodes:`, nodeRegistry.map(n => n.displayName));

export default nodeRegistry;