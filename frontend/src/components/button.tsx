import Spinner from "@/icons/spinner.svg";
import noop from "@/utils/noop";

type ButtonProps = {
  label?: string,
  type?: 'secondaryOutlined' | 'primaryOutlined' | 'primary' | 'secondary' | 'warning' | 'critical' | 'image',
  className?: string,
  href?: string,
  isSubmit?: boolean,
  disabled?: boolean,
  loading?: boolean,
  children?: React.ReactElement,
  onClick?: () => void,
}

export default function Button({ label, href, className: extraClassName = '', type = 'primary', isSubmit = false, disabled = false, loading = false, onClick = noop, children }: ButtonProps) {
  if (type === 'image') {
    const imageClassName = "disabled:cursor-not-allowed " + extraClassName;
    return <button disabled={disabled} onClick={onClick} className={imageClassName} type="button">
      { loading ? <Spinner className="h-5 w-5 animate-spin"/> : children}
    </button>
  }

  const colors = {
    'primaryOutlined': 'bg-white hover:bg-slate-100 text-queuegreen focus:ring-white focus:ring-offset-queuegreen',
    'secondaryOutlined': 'bg-white hover:bg-slate-100 text-slate-700 focus:ring-white focus:ring-offset-queuegreen',
    'warning': 'bg-yellow-500 text-white hover:bg-yellow-500/80 focus:ring-yellow-500 focus:ring-offset-white',
    'critical': 'bg-red-500 text-white hover:bg-red-400/80 focus:ring-red-400 focus:ring-offset-white',
    'primary': 'bg-queuegreen hover:bg-queuegreen/80 text-white focus:ring-queuegreen focus:ring-offset-white disabled:bg-queuegreen/60',
    'secondary': 'bg-slate-500 hover:bg-slate-500/80 text-white focus:ring-slate-500 focus:ring-offset-white',
  };

  const box = `py-2 px-6 rounded flex items-center`;
  const font = ``;
  const ring = `focus:outline-none focus:ring-2 focus:ring-offset-2`
  const disabledClassName = `disabled:cursor-not-allowed`
  const className = `${box} ${font} ${ring} ${colors[type]} ${disabledClassName} ${extraClassName}`;
  const buttonType = isSubmit ? `submit` : `button`;

  return href ?
    <a href={href} className={`${className} inline-block`}>{children ? children : label}</a> :
    <button disabled={disabled} onClick={onClick} className={className} type={buttonType}>
      {loading  ? <Spinner className="h-5 w-5 animate-spin"/> : children ? children : label }
    </button>
}