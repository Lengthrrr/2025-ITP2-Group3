def create_marker(shape: str,
                  width: int,
                  height: int,
                  color: str,
                  border_width: int,
                  border_color: str,
                  shadow_width: int,
                  shadow_alpha: float):
    # Common box-shadow string
    box_shadow = f"0 0 {shadow_width}px rgba(0,0,0,{shadow_alpha})"

    if shape.lower() == "diamond":
        html = f"""
<div style="
  width:{width}px;
  height:{height}px;
  background:{color};
  border:{border_width}px solid {border_color};
  transform: rotate(45deg);
  box-shadow:{box_shadow};
"></div>
"""
    elif shape.lower() == "square":
        html = f"""
<div style="
  width:{width}px;
  height:{height}px;
  background:{color};
  border:{border_width}px solid {border_color};
  box-shadow:{box_shadow};
"></div>
"""
    elif shape.lower() == "triangle":
        # For triangle, width/height correspond to the borders
        html = f"""
<div style="
  width: 0;
  height: 0;
  border-left: {width//2}px solid transparent;
  border-right: {width//2}px solid transparent;
  border-bottom: {height}px solid {color};
  box-shadow:{box_shadow};
"></div>
"""
    else:
        raise ValueError("Unsupported shape. Choose 'diamond', 'square', or 'triangle'.")

    return html
