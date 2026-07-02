import * as SeparatorPrimitive from '@radix-ui/react-separator'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const separatorVariants = cva(
  'shrink-0 bg-border',
  {
    variants: {
      orientation: {
        horizontal: 'h-[1px] w-full',
        vertical: 'h-full w-[1px]',
      },
      decorative: {
        true: '',
        false: 'data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
      decorative: true,
    },
  }
)

function Separator({
  className,
  orientation,
  decorative,
  ...props
}: SeparatorPrimitive.SeparatorProps & VariantProps<typeof separatorVariants>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      data-orientation={orientation}
      className={cn(separatorVariants({ orientation, decorative, className }))}
      {...props}
    />
  )
}

export { Separator, separatorVariants }
