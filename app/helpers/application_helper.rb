module ApplicationHelper

  #Return a title on a per-page basis
  def title
    base_title = "Last Plant"
	
    if @title.nil?
      base_title
    else
      "#{base_title} | #{@title}"
    end
  end

  def logo
    logo = image_tag("logo_turm_web.png", :alt => "Last Plant")
  end

  def protect_img
    protect_img = image_tag("plant_small.png", :alt => "The Last Plant")
  end

  def destroy_img
    destroy_img = image_tag("destroy_small.png", :alt => "Last Plant Monster");
  end

end
