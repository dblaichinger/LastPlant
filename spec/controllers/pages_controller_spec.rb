require 'spec_helper'

describe PagesController do
	render_views

before(:each) do    
   @base_title = "Last Plant"   
end
	
  describe "GET 'about'" do
    it "should be successful" do
      get 'about'
      response.should be_success
    end

    it "should have the right title" do
      get 'about'
      response.should have_selector("title",
                                    :content => @base_title + " | About")
    end
  end

  describe "GET 'imprint'" do
    it "should be successful" do
      get 'imprint'
      response.should be_success
    end

    it "should have the right title" do
      get 'imprint'
      response.should have_selector("title",
                                    :content => @base_title + " | Imprint")
    end
  end
end

