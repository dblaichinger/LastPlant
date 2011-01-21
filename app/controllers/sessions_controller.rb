class SessionsController < ApplicationController
  
  before_filter :authenticate, :only => [:destroy]
  
  def new
  	@title = "Sign in"

    if(current_user)
      session[:id] = current_user.id
      redirect_to current_user
      return
    end
    
    # Calls Method for Login with Facebook
    facebook_login
  end
 
  def create
	  user = User.authenticate(params[:session][:email], params[:session][:password])
	  
	  if user.nil?
      flash[:error] = "Invalid email/password combination."
      @title = "Sign in"
      redirect_to root_path
	  else
      sign_in user
      redirect_to user
	  end
  end
  
  def destroy
    sign_out
    redirect_to root_path
  end
end
