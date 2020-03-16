import Portal from 'rc-util/lib/PortalWrapper';
import * as React from 'react';
import { polyfill } from 'react-lifecycles-compat';

import Child from './DrawerChild';
import { IDrawerProps, IDrawerChildProps } from './IDrawerPropTypes';

type IStringOrHtmlElement = string | HTMLElement;

interface IState {
  open: boolean;
}

interface IChildProps extends IDrawerChildProps {
  visible?: boolean;
  afterClose?: () => void;
}
class DrawerWrapper extends React.Component<IDrawerProps, IState> {
  public static defaultProps = {
    prefixCls: 'drawer',
    placement: 'left',
    getContainer: 'body',
    defaultOpen: false,
    level: 'all',
    duration: '.3s',
    ease: 'cubic-bezier(0.78, 0.14, 0.15, 0.86)',
    onChange: () => {},
    afterVisibleChange: () => {},
    handler: (
      <div className="drawer-handle">
        <i className="drawer-handle-icon" />
      </div>
    ),
    showMask: true,
    maskClosable: true,
    maskStyle: {},
    wrapperClassName: '',
    className: '',
    keyboard: true,
    forceRender: false,
  };

  public static getDerivedStateFromProps(
    props: IDrawerProps,
    { prevProps }: { prevProps: IDrawerProps },
  ) {
    const newState: {
      open?: boolean;
      prevProps: IDrawerProps;
    } = {
      prevProps: props,
    };
    if (typeof prevProps !== 'undefined' && props.open !== prevProps.open) {
      newState.open = props.open;
    }
    return newState;
  }

  public dom: HTMLElement | null;
  private getContainer:
    | IStringOrHtmlElement
    | (() => IStringOrHtmlElement)
    | null
    | false;

  constructor(props: IDrawerProps) {
    super(props);
    const open =
      typeof props.open !== 'undefined' ? props.open : !!props.defaultOpen;
    this.state = {
      open,
    };
    this.getContainer = props.getContainer;
    if ('onMaskClick' in props) {
      console.warn('`onMaskClick` are removed, please use `onClose` instead.');
    }
  }

  public componentDidUpdate() {
    const { getContainer } = this.props;
    if (getContainer) {
      if (
        typeof getContainer === 'string' &&
        typeof this.getContainer === 'string' &&
        document.querySelectorAll(getContainer)[0] !==
          document.querySelectorAll(this.getContainer)[0]
      ) {
        this.getContainer = getContainer;
      } else if (
        typeof getContainer === 'function' &&
        typeof this.getContainer === 'function' &&
        getContainer() !== this.getContainer()
      ) {
        this.getContainer = getContainer;
      } else if (
        typeof getContainer === 'object' &&
        getContainer instanceof window.HTMLElement &&
        typeof this.getContainer === 'object' &&
        this.getContainer instanceof window.HTMLElement &&
        getContainer !== this.getContainer
      ) {
        this.getContainer = getContainer;
      }
    }
  }

  private onHandleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    const { onHandleClick, open: $open } = this.props;
    if (onHandleClick) {
      onHandleClick(e);
    }
    if (typeof $open === 'undefined') {
      const { open } = this.state;
      this.setState({
        open: !open,
      });
    }
  };

  private onClose = (e: React.MouseEvent | React.KeyboardEvent) => {
    const { onClose, open } = this.props;
    if (onClose) {
      onClose(e);
    }
    if (typeof open === 'undefined') {
      this.setState({
        open: false,
      });
    }
  };

  // tslint:disable-next-line:member-ordering
  public render() {
    const {
      defaultOpen,
      getContainer,
      wrapperClassName,
      forceRender,
      handler,
      ...props
    } = this.props;
    const { open } = this.state;
    // 渲染在当前 dom 里；
    if (!getContainer) {
      return (
        <div
          className={wrapperClassName}
          ref={c => {
            this.dom = c;
          }}
        >
          <Child
            {...props}
            open={open}
            handler={handler}
            getContainer={() => this.dom as HTMLElement}
            onClose={this.onClose}
            onHandleClick={this.onHandleClick}
          />
        </div>
      );
    }
    // 如果有 handler 为内置强制渲染；
    const $forceRender = !!handler || forceRender;

    return (
      <Portal
        visible={open}
        forceRender={$forceRender}
        getContainer={getContainer}
        wrapperClassName={wrapperClassName}
      >
        {({ visible, afterClose, ...rest }: IChildProps) => (
          // react 15，componentWillUnmount 时 Portal 返回 afterClose, visible.
          <Child
            {...props}
            {...rest}
            open={visible !== undefined ? visible : open}
            afterVisibleChange={
              afterClose !== undefined ? afterClose : props.afterVisibleChange
            }
            handler={handler}
            onClose={this.onClose}
            onHandleClick={this.onHandleClick}
          />
        )}
      </Portal>
    );
  }
}

export default polyfill(DrawerWrapper);
