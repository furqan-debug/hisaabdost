import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { headerAnimations } from "@/utils/animations";

interface PageHeaderProps {
  className?: string;
  variant?: "card" | "simple";
  animated?: boolean;
  children?: React.ReactNode;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, variant = "simple", animated = true, children }, ref) => {
    const baseClassName = cn(
      "w-full",
      variant === "card" && "page-header-card p-4 sm:p-6",
      variant === "simple" && "space-y-1",
      className
    );

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={baseClassName}
          {...headerAnimations.container}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={baseClassName}>
        {children}
      </div>
    );
  }
);
PageHeader.displayName = "PageHeader";

interface PageHeaderTitleProps {
  className?: string;
  gradient?: boolean;
  animated?: boolean;
  children?: React.ReactNode;
}

const PageHeaderTitle = React.forwardRef<HTMLHeadingElement, PageHeaderTitleProps>(
  ({ className, gradient = false, animated = true, children }, ref) => {
    const baseClassName = cn(
      "text-2xl md:text-3xl font-bold tracking-tight",
      gradient ? "page-header-gradient-text" : "text-foreground",
      className
    );

    if (animated) {
      return (
        <motion.h1
          ref={ref}
          className={baseClassName}
          {...headerAnimations.title}
        >
          {children}
        </motion.h1>
      );
    }

    return (
      <h1 ref={ref} className={baseClassName}>
        {children}
      </h1>
    );
  }
);
PageHeaderTitle.displayName = "PageHeaderTitle";

interface PageHeaderDescriptionProps {
  className?: string;
  animated?: boolean;
  children?: React.ReactNode;
}

const PageHeaderDescription = React.forwardRef<HTMLParagraphElement, PageHeaderDescriptionProps>(
  ({ className, animated = true, children }, ref) => {
    const baseClassName = cn("text-sm md:text-base text-muted-foreground", className);

    if (animated) {
      return (
        <motion.p
          ref={ref}
          className={baseClassName}
          {...headerAnimations.title}
        >
          {children}
        </motion.p>
      );
    }

    return (
      <p ref={ref} className={baseClassName}>
        {children}
      </p>
    );
  }
);
PageHeaderDescription.displayName = "PageHeaderDescription";

interface PageHeaderBadgeProps {
  className?: string;
  animated?: boolean;
  children?: React.ReactNode;
}

const PageHeaderBadge = React.forwardRef<HTMLDivElement, PageHeaderBadgeProps>(
  ({ className, animated = true, children }, ref) => {
    const baseClassName = cn("page-header-badge", className);

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={baseClassName}
          {...headerAnimations.badge}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={baseClassName}>
        {children}
      </div>
    );
  }
);
PageHeaderBadge.displayName = "PageHeaderBadge";

interface PageHeaderActionsProps {
  className?: string;
  animated?: boolean;
  children?: React.ReactNode;
}

const PageHeaderActions = React.forwardRef<HTMLDivElement, PageHeaderActionsProps>(
  ({ className, animated = true, children }, ref) => {
    const baseClassName = cn("flex items-center gap-3", className);

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={baseClassName}
          {...headerAnimations.badge}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={baseClassName}>
        {children}
      </div>
    );
  }
);
PageHeaderActions.displayName = "PageHeaderActions";

export {
  PageHeader,
  PageHeaderTitle,
  PageHeaderDescription,
  PageHeaderBadge,
  PageHeaderActions,
};
