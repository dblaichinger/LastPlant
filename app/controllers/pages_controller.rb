class PagesController < ApplicationController

before_filter :authenticate, :only => [:about, :help]

  def home
    @title = "Home"
  end
  
  def about
    @title = "About"
  end
 
  def help
    @title = "Help"
  end
  

end
