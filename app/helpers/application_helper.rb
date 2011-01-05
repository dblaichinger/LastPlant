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

end
