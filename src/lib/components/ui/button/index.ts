import type { Button as ButtonPrimitive } from 'bits-ui';
import { tv, type VariantProps } from 'tailwind-variants';
import Root from './button.svelte';

const buttonVariants = tv({
	base: 'inline-flex items-center justify-center rounded-full text-sm font-semibold tracking-[-0.02em] whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
	variants: {
		variant: {
			default:
				'bg-primary text-primary-foreground shadow-[0_16px_40px_rgba(0,0,0,0.28)] hover:bg-primary/92 hover:-translate-y-px',
			destructive:
				'bg-destructive text-destructive-foreground shadow-[0_16px_40px_rgba(0,0,0,0.22)] hover:bg-destructive/90',
			outline:
				'border border-white/10 bg-white/[0.04] shadow-[0_12px_30px_rgba(0,0,0,0.16)] hover:bg-white/[0.08] hover:text-accent-foreground',
			secondary:
				'bg-secondary text-secondary-foreground shadow-[0_12px_30px_rgba(0,0,0,0.16)] hover:bg-secondary/84',
			ghost: 'hover:bg-white/[0.06] hover:text-accent-foreground',
			link: 'text-primary underline-offset-4 hover:underline'
		},
		size: {
			default: 'h-11 px-5 py-2.5',
			sm: 'h-9 px-4 text-xs',
			lg: 'h-12 px-8 text-base',
			icon: 'h-11 w-11'
		}
	},
	defaultVariants: {
		variant: 'default',
		size: 'default'
	}
});

type Variant = VariantProps<typeof buttonVariants>['variant'];
type Size = VariantProps<typeof buttonVariants>['size'];

type Props = ButtonPrimitive.Props & {
	variant?: Variant;
	size?: Size;
};

type Events = ButtonPrimitive.Events;

export {
	Root,
	type Props,
	type Events,
	//
	Root as Button,
	type Props as ButtonProps,
	type Events as ButtonEvents,
	buttonVariants
};
