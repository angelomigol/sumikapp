import { z } from "zod";

import { OJTStatus, Role } from "@/lib/constants";

import { NavigationConfigSchema } from "@/schemas/config/navigation-config.schema";

type NavigationConfig = z.infer<typeof NavigationConfigSchema>;
type RouteGroup = NavigationConfig["routes"][number];
type RouteChild = Extract<RouteGroup, { children: any }>["children"][number];

export function useFilteredNavigation(
  config: NavigationConfig,
  userRole: Role,
  ojtStatus?: OJTStatus // Add OJT status parameter
) {
  return filterNavigationByRole(config, userRole, ojtStatus);
}

/**
 * @name filterNavigationByRole
 * @description Filters navigation routes based on user role authorization and OJT status.
 * @param config - The navigation configuration object
 * @param userRole - The current user's role
 * @param ojtStatus - The current user's OJT status (required for trainee role)
 * @returns Filtered navigation configuration with only authorized routes
 */
export function filterNavigationByRole(
  config: NavigationConfig,
  userRole: string,
  ojtStatus?: OJTStatus
): NavigationConfig {
  const filteredRoutes = config.routes
    .map((route) => {
      // Handle divider items (they don't have children)
      if (!("children" in route)) {
        return route;
      }

      // Filter children based on authorization
      const filteredChildren = route.children
        .map((child) => {
          // Check if child is authorized for the user role
          if (
            child.authorizedRoles &&
            !child.authorizedRoles.includes(userRole as any)
          ) {
            return null;
          }

          // Additional filtering for trainee role based on OJT status
          if (userRole === "trainee" && child.allowedOJTStatus) {
            // If OJT status is not provided for trainee, exclude routes that require specific status
            if (!ojtStatus) {
              return null;
            }

            // Check if the current OJT status is allowed for this route
            if (!child.allowedOJTStatus.includes(ojtStatus)) {
              return null;
            }
          }

          // If child has sub-children, filter them too
          if (child.children && child.children.length > 0) {
            const filteredSubChildren = child.children.filter((subChild) => {
              // Check role authorization for sub-children
              const isRoleAuthorized =
                !subChild.authorizedRoles ||
                subChild.authorizedRoles.includes(userRole as any);

              // Check OJT status for trainee sub-children
              let isOJTStatusAllowed = true;
              if (userRole === "trainee" && subChild.allowedOJTStatus) {
                isOJTStatusAllowed = ojtStatus
                  ? subChild.allowedOJTStatus.includes(ojtStatus)
                  : false;
              }

              return isRoleAuthorized && isOJTStatusAllowed;
            });

            // Only include the child if it has remaining sub-children or no authorization restrictions
            if (
              filteredSubChildren.length > 0 ||
              !child.children.some(
                (sc) => sc.authorizedRoles || sc.allowedOJTStatus
              )
            ) {
              return {
                ...child,
                children: filteredSubChildren,
              };
            }
            return null;
          }

          return child;
        })
        .filter((child): child is RouteChild => child !== null);

      // Only include the route group if it has remaining children
      if (filteredChildren.length > 0) {
        return {
          ...route,
          children: filteredChildren,
        };
      }

      return null;
    })
    .filter((route): route is RouteGroup => route !== null);

  return {
    ...config,
    routes: filteredRoutes,
  };
}
