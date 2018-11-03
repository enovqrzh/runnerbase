import React from 'react';

class SourceLink extends React.PureComponent {
  constructor(props, context) {
    super(props, context);
    this.amznOut = this.amznOut.bind(this);

    this.state = {
      amazonLink: "https://www.amazon.com"
    };
  }

  amznOut() {
    window.open(this.state.amazonLink, "_blank");
  }

  render() {
    // Has to be span to avoid nesting a tags in select
    return(
      <span className="rb-source-link" href={this.state.amazonLink} onClick={this.amznOut}>{this.props.source} {this.props.page}</span>
    );
  }
}

export default SourceLink;
