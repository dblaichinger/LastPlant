module SessionsHelper

def sign_in(user)
    cookies.permanent.signed[:remember_token] = [user.id, user.salt]
    current_user = user
  end

  def current_user=(user)
    @current_user = user
  end

  def current_user
    @current_user ||= user_from_remember_token
  end

  def signed_in?
    !current_user.nil? || session['fb_id'] 
  end

  def sign_out
    cookies.delete(:remember_token)
    current_user = nil
  end

  def current_user?(user)
    user == current_user
  end


  def deny_access
  	session[:return_to] = request.fullpath
    flash[:notice] = "Please sign in to access this page."
	redirect_to signin_path
  end
 
 # def redirect_back_or(default)
  #  redirect_to(session[:return_to] || default)
   # session[:return_to] = nil
  #end

    def authenticate
      deny_access unless signed_in?
    end

    def correct_user
      @user = User.find(params[:id])
      redirect_to(root_path) unless current_user?(@user)
    end
	
	def admin_user
		if (current_user)
		redirect_to(root_path) unless current_user.admin?
		else
		redirect_to(root_path)
		end
    end


#  private

    def user_from_remember_token
	    User.authenticate_with_salt(*remember_token)
    end

    def remember_token
      cookies.signed[:remember_token] || [nil, nil]
    end

	def establish_graph
	 @graph = Koala::Facebook::GraphAPI.new(@token)
	end
	
	def establish_oauth
		@oauth = Koala::Facebook::OAuth.new("115861615151381", '35aba13c7b790d4e41f38feccacbe04a', "http://blaichinger2.heroku.com/")
	end
end
