import clsx from 'clsx';
import styles from './index.module.css';

const PaginationItem = (props: any) => {
  const { className, icon, onClick, disabled } = props;

  return (
    <button
      type="button"
      className={clsx(styles.PaginationItem, className)}
      disabled={disabled}
      style={{
        backgroundImage: `url('${icon}')`
      }}
      onClick={onClick}
    />
  )
}

export default PaginationItem;
