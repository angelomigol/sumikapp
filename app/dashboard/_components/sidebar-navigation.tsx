"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronDown } from "lucide-react";
import { z } from "zod";

import { isRouteActive } from "@/lib/is-route-active";
import { cn } from "@/lib/utils";

import { NavigationConfigSchema } from "@/schemas/config/navigation-config.schema";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

import { If } from "@/components/sumikapp/if";

export default function AppSidebarNavigation({
  config,
}: React.PropsWithChildren<{
  config: z.infer<typeof NavigationConfigSchema>;
}>) {
  const currentPath = usePathname() ?? "";
  const { open } = useSidebar();

  return (
    <>
      {config.routes.map((item, index) => {
        const isLast = index === config.routes.length - 1;

        if ("children" in item) {
          const Container = (props: React.PropsWithChildren) => {
            if (item.collapsible) {
              return (
                <Collapsible
                  defaultOpen={!item.collapsed}
                  className={"group/collapsible"}
                >
                  {props.children}
                </Collapsible>
              );
            }

            return <>{props.children}</>;
          };

          const ContentContainer = (props: React.PropsWithChildren) => {
            if (item.collapsible) {
              return <CollapsibleContent>{props.children}</CollapsibleContent>;
            }

            return <>{props.children}</>;
          };

          return (
            <Container key={`collapsible-${index}`}>
              <SidebarGroup key={item.label}>
                <If
                  condition={item.collapsible}
                  fallback={
                    <SidebarGroupLabel className={cn({ hidden: !open })}>
                      {item.label}
                    </SidebarGroupLabel>
                  }
                >
                  <SidebarGroupLabel className={cn({ hidden: !open })} asChild>
                    <CollapsibleTrigger>
                      {item.label}
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                </If>

                <If condition={item.renderAction}>
                  <SidebarGroupAction title={item.label}>
                    {item.renderAction}
                  </SidebarGroupAction>
                </If>

                <SidebarGroupContent>
                  <SidebarMenu>
                    <ContentContainer>
                      {item.children.map((child, childIndex) => {
                        const Container = (props: React.PropsWithChildren) => {
                          if ("collapsible" in child && child.collapsible) {
                            return (
                              <Collapsible
                                defaultOpen={!child.collapsed}
                                className={"group/collapsible"}
                              >
                                {props.children}
                              </Collapsible>
                            );
                          }

                          return <>{props.children}</>;
                        };

                        const TriggerItem = () => {
                          if ("collapsible" in child && child.collapsible) {
                            return (
                              <CollapsibleTrigger asChild>
                                <SidebarMenuButton tooltip={child.label}>
                                  <div
                                    className={cn("flex items-center gap-2", {
                                      "mx-auto w-full gap-0 [&>svg]:flex-1 [&>svg]:shrink-0":
                                        !open,
                                    })}
                                  >
                                    {child.Icon}
                                    <span
                                      className={cn(
                                        "transition-width w-auto transition-opacity duration-500",
                                        {
                                          "w-0 opacity-0": !open,
                                        }
                                      )}
                                    >
                                      {child.label}
                                    </span>

                                    <ChevronDown
                                      className={cn(
                                        "ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180",
                                        {
                                          "hidden size-0": !open,
                                        }
                                      )}
                                    />
                                  </div>
                                </SidebarMenuButton>
                              </CollapsibleTrigger>
                            );
                          }

                          const path = "path" in child ? child.path : "";
                          const end = "end" in child ? child.end : false;

                          const isActive = isRouteActive(
                            path,
                            currentPath,
                            end
                          );

                          return (
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              tooltip={child.label}
                            >
                              <Link
                                className={cn(
                                  "text-muted-foreground flex items-center",
                                  {
                                    "mx-auto w-full gap-0! [&>svg]:flex-1":
                                      !open,
                                  }
                                )}
                                href={path}
                              >
                                {child.Icon}
                                <span
                                  className={cn(
                                    "w-auto transition-opacity duration-300",
                                    {
                                      "w-0 opacity-0": !open,
                                    }
                                  )}
                                >
                                  {child.label}
                                </span>
                              </Link>
                            </SidebarMenuButton>
                          );
                        };

                        return (
                          <Container key={`group-${index}-${childIndex}`}>
                            <SidebarMenuItem>
                              <TriggerItem />

                              <If condition={child.renderAction}>
                                <SidebarMenuAction>
                                  {child.renderAction}
                                </SidebarMenuAction>
                              </If>
                            </SidebarMenuItem>
                          </Container>
                        );
                      })}
                    </ContentContainer>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <If condition={!open && !isLast}>
                <SidebarSeparator />
              </If>
            </Container>
          );
        }
      })}
    </>
  );
}
