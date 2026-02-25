export function partitionPermissions(permissions = []) {
  // Group permissions by their resource inferred from name.
  // e.g. 'employee_view' -> resource 'employee'
  const knownSuffixes = new Set(['view', 'add', 'edit', 'delete']);

  const groupsMap = new Map();
  const others = [];

  permissions.forEach((perm) => {
    const parts = perm.name.split('_');
    let resource = parts.slice(0, -1).join('_');

    // If last token is not a known action, fallback to first token
    const last = parts[parts.length - 1];
    if (!knownSuffixes.has(last)) {
      resource = parts[0];
    }

    if (resource) {
      if (!groupsMap.has(resource)) groupsMap.set(resource, []);
      groupsMap.get(resource).push(perm);
    } else {
      others.push(perm);
    }
  });

  // Build groups array sorted alphabetically by resource
  const groups = Array.from(groupsMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([resource, children]) => ({
      key: `manage_${resource}`,
      labelKey: `permissions.manage_${resource}`,
      resource,
      children,
    }));

  return { groups, others };
}
