"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.promise.js");

require("core-js/modules/es.symbol.description.js");

require("core-js/modules/es.array.sort.js");

var _bs = require("react-icons/bs");

var _react = require("react");

var _reactModal = _interopRequireDefault(require("react-modal"));

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const repo = [];
const DEVELOPMENT = true;

function Tag(props) {
  const [tags, setTags] = (0, _react.useState)({});
  const [newTag, setNewTag] = (0, _react.useState)("");
  const [originalTags, setOriginalTags] = (0, _react.useState)({});
  (0, _react.useEffect)(async () => {
    getTags();
  }, []);

  async function handleCreateTag() {
    await _axios.default.post("http://localhost:5000/tag", {
      "description": newTag
    });
    getTags();
    setNewTag("");
  }

  async function getTags() {
    let o = {}; // Get all tags.

    let res = await _axios.default.get("http://localhost:5000/tag");
    res.data["tags"].forEach(tag => o[tag['id']] = {
      'description': tag['description'],
      'checked': false
    }); // Get checked tags.

    res = await _axios.default.get("http://localhost:5000/documentation/".concat(props.uc_id, "/tag"));

    for (let tag of res.data['tags']) o[tag['tag_id']]['checked'] = true;

    setTags(o);
    setOriginalTags(_objectSpread({}, o));
  }

  function getUpdates(newTags) {
    const updates = {};

    for (let key in originalTags) if (originalTags[key]['checked'] !== newTags[key]['checked']) updates[key] = newTags[key]['checked'];

    return updates;
  }

  function handleTagClick(tagId) {
    let n = {};

    for (let tag in tags) n[tag] = _objectSpread({}, tags[tag]);

    n[tagId]['checked'] = !n[tagId]['checked'];
    setTags(n);
    props.setUpdates(getUpdates(n));
  }

  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("form", null, Object.keys(tags).map((tag, indx) => /*#__PURE__*/React.createElement("span", {
    style: {
      border: "1px solid",
      marginRight: "5px",
      borderRadius: "2px",
      key: indx
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: tags[tag]['checked'] ? 'checked' : '',
    onClick: e => handleTagClick(tag)
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      display: "inline-block"
    }
  }, tags[tag]['description'])))), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      handleCreateTag();
      e.preventDefault();
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    onChange: e => setNewTag(e.target.value),
    value: newTag
  }), /*#__PURE__*/React.createElement("input", {
    type: "submit",
    value: "add"
  })));
}

function UserControl(props) {
  const [modalOpen, setModalOpen] = (0, _react.useState)(false);
  const [documentation, setDocumentation] = (0, _react.useState)("");
  const [location, setLocation] = (0, _react.useState)("");
  const [tagUpdates, setTagUpdates] = (0, _react.useState)({});
  const isAnnotated = props.tag != null;
  let tag;
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)"
    }
  };

  if (isAnnotated) {
    if (!(props.tag in repo)) repo.push(props.tag);
    tag = props.tag;
  } else {
    tag = (repo.sort()[repo.length - 1] || 0) + 1;
  }

  (0, _react.useEffect)(async () => {
    let res = await _axios.default.get("http://localhost:5000/documentation/".concat(tag));
    setDocumentation(res.data["description"]);
    setLocation(res.data["location"]);
  }, [modalOpen]);

  function handleSubmitModal() {
    _axios.default.post("http://localhost:5000/documentation/".concat(tag), {
      description: documentation,
      location: location
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    _axios.default.post("http://localhost:5000/documentation/".concat(tag, "/tag"), {
      tags: Object.entries(tagUpdates).filter(e => e[1] === true).map(e => e[0])
    });

    _axios.default.patch("http://localhost:5000/documentation/".concat(tag, "/tag"), {
      tags: Object.entries(tagUpdates).filter(e => e[1] === false).map(e => e[0])
    });

    handleCloseModal();
  }

  function handleCloseModal() {
    setDocumentation("");
    setLocation("");
    setModalOpen(false);
  }

  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex"
    }
  }, props.children, DEVELOPMENT && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_bs.BsFillInfoCircleFill, {
    style: {
      cursor: "pointer",
      color: isAnnotated ? "green" : "red"
    },
    onClick: () => setModalOpen(true)
  }), /*#__PURE__*/React.createElement(_reactModal.default, {
    isOpen: modalOpen,
    style: customStyles
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flexDirection: "row"
    }
  }, isAnnotated ? /*#__PURE__*/React.createElement("div", null, "id #", props.tag) : /*#__PURE__*/React.createElement("div", null, "Sign with tag={".concat(tag, "}"))), isAnnotated && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Description"), /*#__PURE__*/React.createElement("textarea", {
    type: "text",
    style: {
      width: "400px",
      height: "200px"
    },
    onChange: e => setDocumentation(e.target.value),
    value: documentation
  }), /*#__PURE__*/React.createElement("h4", null, "Location"), /*#__PURE__*/React.createElement("textarea", {
    type: "text",
    style: {
      width: "400px",
      height: "80px"
    },
    onChange: e => setLocation(e.target.value),
    value: location
  }), /*#__PURE__*/React.createElement("h4", null, "Tags"), /*#__PURE__*/React.createElement(Tag, {
    uc_id: tag,
    setUpdates: setTagUpdates
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "10px"
    }
  }), isAnnotated && /*#__PURE__*/React.createElement("button", {
    onClick: () => handleSubmitModal()
  }, "Submit"), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleCloseModal()
  }, "Close")))));
}

var _default = UserControl;
exports.default = _default;