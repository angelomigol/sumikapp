"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";

import { cleanSlugAdvanced } from "@/utils/shared";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { If } from "./if";

const unslugify = (slug: string) => slug.replace(/-/g, " ");

const isUUID = (str: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export function AppBreadcrumbs(props: {
  values?: Record<string, string>;
  maxDepth?: number;
}) {
  const pathName = usePathname();
  const splitPath = pathName.split("/").filter(Boolean);
  const values = props.values ?? {};
  const maxDepth = props.maxDepth ?? 4;

  const Ellipsis = (
    <BreadcrumbItem>
      <BreadcrumbEllipsis className="h-4 w-4" />
    </BreadcrumbItem>
  );

  const showEllipsis = splitPath.length > maxDepth;

  const visiblePaths = showEllipsis
    ? ([splitPath[0], ...splitPath.slice(-maxDepth + 1)] as string[])
    : splitPath;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {visiblePaths.map((path, index) => {
          let label: string;

          if (path in values) {
            label = values[path];
          } else if (isUUID(path)) {
            label = "Details";
          } else {
            label = unslugify(path);
          }

          return (
            <Fragment key={index}>
              <BreadcrumbItem className={"capitalize lg:text-xs"}>
                <If
                  condition={index < visiblePaths.length - 1}
                  fallback={cleanSlugAdvanced(label, {
                    preserveOriginal: true,
                  })}
                >
                  <BreadcrumbLink
                    href={
                      "/" +
                      splitPath.slice(0, splitPath.indexOf(path) + 1).join("/")
                    }
                  >
                    {cleanSlugAdvanced(label, {
                      preserveOriginal: true,
                    })}
                  </BreadcrumbLink>
                </If>
              </BreadcrumbItem>

              {index === 0 && showEllipsis && (
                <>
                  <BreadcrumbSeparator />
                  {Ellipsis}
                </>
              )}

              <If condition={index !== visiblePaths.length - 1}>
                <BreadcrumbSeparator />
              </If>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
